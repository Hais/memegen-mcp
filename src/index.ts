#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { z } from "zod";

const MEMEGEN_API_BASE = "https://api.memegen.link";

interface Template {
  id: string;
  name: string;
  lines?: number;
  overlays?: number;
  styles?: string[];
  blank: string;
  example?: {
    text: string[];
    url: string;
  };
  source?: string;
  keywords?: string[];
}

interface MemeResponse {
  url: string;
}

const server = new Server(
  {
    name: "memegen-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const ListTemplatesSchema = z.object({
  filter: z.string().optional().describe("Optional search filter for template names"),
  animated: z.boolean().optional().describe("Filter for animated templates only"),
});

const CreateMemeSchema = z.object({
  template_id: z.string().describe("The ID of the meme template to use"),
  top_text: z.string().optional().describe("Text for the top of the meme"),
  bottom_text: z.string().optional().describe("Text for the bottom of the meme"),
  text_lines: z.array(z.string()).optional().describe("Array of text lines for multi-line memes"),
  style: z.string().optional().describe("Style variant to use"),
  font: z.string().optional().describe("Font to use for the text"),
  extension: z.enum(["png", "jpg", "gif", "webp"]).optional().default("png").describe("Image format"),
});

const SearchTemplatesSchema = z.object({
  query: z.string().describe("Search query for finding templates"),
});

const GetTemplateInfoSchema = z.object({
  template_id: z.string().describe("The ID of the template to get information about"),
});

async function fetchTemplates(filter?: string, animated?: boolean): Promise<Template[]> {
  try {
    const params = new URLSearchParams();
    if (filter) params.append("filter", filter);
    if (animated !== undefined) params.append("animated", String(animated));
    
    const response = await axios.get(`${MEMEGEN_API_BASE}/templates`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw new Error("Failed to fetch templates from memegen API");
  }
}

async function getTemplateInfo(templateId: string): Promise<Template | null> {
  try {
    const response = await axios.get(`${MEMEGEN_API_BASE}/templates/${templateId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw new Error(`Failed to get template info: ${error}`);
  }
}

function generateMemeUrl(
  templateId: string,
  texts: string[],
  style?: string,
  font?: string,
  extension: string = "png"
): string {
  const encodedTexts = texts.map(text => {
    if (!text || text.trim() === "") return "_";
    
    return text
      .replace(/_/g, "__")
      .replace(/ /g, "_")
      .replace(/\?/g, "~q")
      .replace(/%/g, "~p")
      .replace(/#/g, "~h")
      .replace(/\//g, "~s")
      .replace(/\\/g, "~b")
      .replace(/</g, "~l")
      .replace(/>/g, "~g")
      .replace(/"/g, "''")
      .replace(/\n/g, "~n");
  });

  let url = `${MEMEGEN_API_BASE}/images/${templateId}`;
  
  if (encodedTexts.length > 0) {
    url += `/${encodedTexts.join("/")}`;
  }
  
  url += `.${extension}`;
  
  const params = new URLSearchParams();
  if (style) params.append("style", style);
  if (font) params.append("font", font);
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return url;
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_templates",
        description: "List available meme templates from memegen.link",
        inputSchema: {
          type: "object",
          properties: {
            filter: { type: "string", description: "Optional search filter for template names" },
            animated: { type: "boolean", description: "Filter for animated templates only" },
          },
        },
      },
      {
        name: "create_meme",
        description: "Generate a meme image URL with custom text",
        inputSchema: {
          type: "object",
          properties: {
            template_id: { type: "string", description: "The ID of the meme template to use" },
            top_text: { type: "string", description: "Text for the top of the meme" },
            bottom_text: { type: "string", description: "Text for the bottom of the meme" },
            text_lines: { 
              type: "array", 
              items: { type: "string" },
              description: "Array of text lines for multi-line memes (use this OR top_text/bottom_text)" 
            },
            style: { type: "string", description: "Style variant to use" },
            font: { type: "string", description: "Font to use for the text" },
            extension: { 
              type: "string", 
              enum: ["png", "jpg", "gif", "webp"],
              description: "Image format (default: png)" 
            },
          },
          required: ["template_id"],
        },
      },
      {
        name: "search_templates",
        description: "Search for meme templates by keyword",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query for finding templates" },
          },
          required: ["query"],
        },
      },
      {
        name: "get_template_info",
        description: "Get detailed information about a specific meme template",
        inputSchema: {
          type: "object",
          properties: {
            template_id: { type: "string", description: "The ID of the template to get information about" },
          },
          required: ["template_id"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "list_templates": {
      const args = ListTemplatesSchema.parse(request.params.arguments);
      const templates = await fetchTemplates(args.filter, args.animated);
      
      const templateList = templates.map((t) => ({
        id: t.id,
        name: t.name,
        lines: t.lines || 2,
        example: t.example?.url || t.blank,
        keywords: t.keywords || [],
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(templateList, null, 2),
          },
        ],
      };
    }

    case "create_meme": {
      const args = CreateMemeSchema.parse(request.params.arguments);
      
      let texts: string[] = [];
      if (args.text_lines && args.text_lines.length > 0) {
        texts = args.text_lines;
      } else {
        if (args.top_text) texts.push(args.top_text);
        if (args.bottom_text) texts.push(args.bottom_text);
      }
      
      if (texts.length === 0) {
        texts = ["", ""];
      }
      
      const url = generateMemeUrl(
        args.template_id,
        texts,
        args.style,
        args.font,
        args.extension
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ url, template_id: args.template_id }, null, 2),
          },
        ],
      };
    }

    case "search_templates": {
      const args = SearchTemplatesSchema.parse(request.params.arguments);
      const allTemplates = await fetchTemplates();
      
      const query = args.query.toLowerCase();
      const matchedTemplates = allTemplates.filter((t) => {
        const searchableText = `${t.id} ${t.name} ${(t.keywords || []).join(" ")}`.toLowerCase();
        return searchableText.includes(query);
      });

      const results = matchedTemplates.map((t) => ({
        id: t.id,
        name: t.name,
        lines: t.lines || 2,
        example: t.example?.url || t.blank,
        keywords: t.keywords || [],
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }

    case "get_template_info": {
      const args = GetTemplateInfoSchema.parse(request.params.arguments);
      const template = await getTemplateInfo(args.template_id);
      
      if (!template) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: `Template '${args.template_id}' not found` }, null, 2),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(template, null, 2),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MemeGen MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});