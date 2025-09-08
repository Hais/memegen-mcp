# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Development mode (runs TypeScript directly with tsx)
npm run dev

# Build TypeScript to dist/
npm run build

# Run production server (requires build first)
npm start

# Build is automatically run on npm prepare
```

## Architecture Overview

This is a Model Context Protocol (MCP) server that wraps the memegen.link API. The entire server is implemented in a single file `src/index.ts` for simplicity.

### Core Components

- **MCP Server**: Uses `@modelcontextprotocol/sdk` for stdio transport
- **API Client**: Axios-based client for memegen.link REST API
- **Schema Validation**: Zod schemas for all tool inputs
- **URL Generation**: Custom URL encoding logic for meme text

### Available Tools

1. `list_templates` - Fetches all available meme templates
2. `create_meme` - Generates meme URLs with custom text
3. `search_templates` - Searches templates by keyword across names, IDs, and keywords
4. `get_template_info` - Gets detailed template information
5. `get_random_templates` - Returns 1-5 random templates for inspiration

### Text Encoding Logic

The `generateMemeUrl` function handles special character encoding for meme text:
- Spaces become underscores
- Special characters use tilde encoding (~q for ?, ~p for %, etc.)
- Empty text becomes "_"
- Supports both top/bottom text pairs and multi-line text arrays

### API Integration

- Base URL: `https://api.memegen.link`
- Template fetching: `/templates` endpoint with optional filters
- Image generation: `/images/{template_id}/{text1}/{text2}.{extension}` pattern
- Supports PNG, JPG, GIF, WebP formats

## Key Implementation Details

- The server runs on stdio transport (not HTTP)
- All responses return JSON-formatted text content
- Error handling includes 404 detection for missing templates
- Template search is client-side filtering of all templates
- Meme URLs are generated locally, not fetched from API
- Server logs to stderr to avoid interfering with stdio protocol

## Distribution

The package is designed to run via `npx github:Hais/memegen-mcp` for always-latest versions, with the binary defined in package.json pointing to `dist/index.js`.