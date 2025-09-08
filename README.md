# MemeGen MCP Server

![Memes Everywhere](https://api.memegen.link/images/buzz/memes/memes_everywhere.webp)

A Model Context Protocol (MCP) server that wraps the [memegen.link](https://memegen.link) API, allowing AI assistants to generate meme images with custom text.

## Features

- 🎨 **List Templates**: Browse hundreds of available meme templates
- 🔍 **Search Templates**: Find specific meme formats by keyword
- 🖼️ **Create Memes**: Generate meme URLs with custom text
- 📝 **Template Info**: Get detailed information about any template
- 🎯 **Multiple Formats**: Support for PNG, JPG, GIF, and WebP outputs

## Installation

The easiest way to use this MCP server is directly from GitHub with npx:

```bash
# Run directly from GitHub (recommended)
npx github:Hais/memegen-mcp

# Or install globally
npm install -g memegen-mcp-server
```

## Usage

### Running the Server

The server runs on stdio and can be used with any MCP-compatible client:

```bash
# Run from GitHub (recommended - always gets latest version)
npx github:Hais/memegen-mcp

# Or run locally if installed globally
memegen-mcp-server
```

### Available Tools

#### 1. `list_templates`
Lists available meme templates from memegen.link.

**Parameters:**
- `filter` (optional): Search filter for template names
- `animated` (optional): Filter for animated templates only

**Example Response:**
```json
[
  {
    "id": "drake",
    "name": "Drake",
    "lines": 2,
    "example": "https://api.memegen.link/images/drake/example.png"
  }
]
```

#### 2. `create_meme`
Generates a meme image URL with custom text.

**Parameters:**
- `template_id` (required): The ID of the meme template
- `top_text` (optional): Text for the top of the meme
- `bottom_text` (optional): Text for the bottom of the meme
- `text_lines` (optional): Array of text lines for multi-line memes
- `style` (optional): Style variant to use
- `font` (optional): Font to use for the text
- `extension` (optional): Image format (png, jpg, gif, webp) - default: png

**Example Response:**
```json
{
  "url": "https://api.memegen.link/images/drake/No/Yes.png",
  "template_id": "drake"
}
```

#### 3. `search_templates`
Searches for meme templates by keyword across template names, IDs, and associated keywords.

**Parameters:**
- `query` (required): Search query for finding templates

**Search Categories:**
The search works across a rich collection of meme templates with keywords from:
- **TV Shows & Movies**: "The Office", "Parks and Recreation", "Futurama", "The Simpsons", "Seinfeld", "South Park", "Family Guy", "Archer", "Star Wars", "Lord of the Rings", "Jurassic Park", "Harry Potter", "Lion King", "Anchorman", "Elf"
- **Characters**: "Zoidberg", "Philip J. Fry", "Bart Simpson", "Dr. Nick", "Will Smith", "Admiral Ackbar", "Bilbo Baggins", "Mufasa and Simba"
- **Meme Types**: "object-labeled", "handshake", "epic", "wish", "want", "everybody gets", "you win"
- **Situations**: "Ain't Nobody Got Time For That", "Disappointed Black Guy", "Am I Out Of Touch?", "Sad Frog"

**Example Searches:**
- "office" - finds The Office related memes
- "fry" - finds Philip J. Fry from Futurama memes  
- "handshake" - finds handshake/agreement style memes
- "disappointed" - finds reaction memes

#### 4. `get_template_info`
Gets detailed information about a specific meme template.

**Parameters:**
- `template_id` (required): The ID of the template

#### 5. `get_random_templates`
Gets one or more random meme templates for inspiration and discovery.

**Parameters:**
- `count` (optional): Number of random templates to return (1-5, default: 1)

**Example Response:**
```json
[
  {
    "id": "drake",
    "name": "Drake",
    "lines": 2,
    "example": "https://api.memegen.link/images/drake/example.png",
    "keywords": []
  },
  {
    "id": "fry",
    "name": "Futurama Fry",
    "lines": 2,
    "example": "https://api.memegen.link/images/fry/example.png",
    "keywords": ["Futurama", "Philip J. Fry"]
  }
]
```

## Integration with Claude Desktop

Add this to your Claude Desktop configuration file:

### macOS
Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "memegen": {
      "command": "npx",
      "args": ["github:Hais/memegen-mcp"]
    }
  }
}
```

### Windows
Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "memegen": {
      "command": "npx",
      "args": ["github:Hais/memegen-mcp"]
    }
  }
}
```

## Examples

### Creating a Simple Meme

```javascript
// Request
{
  "tool": "create_meme",
  "arguments": {
    "template_id": "drake",
    "top_text": "Writing documentation",
    "bottom_text": "Making memes instead"
  }
}

// Response
{
  "url": "https://api.memegen.link/images/drake/Writing_documentation/Making_memes_instead.png"
}
```

### Multi-line Memes

```javascript
// Request
{
  "tool": "create_meme",
  "arguments": {
    "template_id": "brain",
    "text_lines": [
      "Small brain: Using stock photos",
      "Medium brain: Creating custom graphics",
      "Large brain: Using memes",
      "Galaxy brain: AI-generated memes"
    ]
  }
}
```

## Development

```bash
# Clone the repository
git clone <repository-url>
cd memegen-mcp-server

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Start production server
npm start
```

## API Documentation

This server wraps the [memegen.link API](https://api.memegen.link/docs/). For more information about available templates, styles, and customization options, visit:

- API Documentation: https://api.memegen.link/docs/
- OpenAPI Spec: https://api.memegen.link/docs/openapi.json
- Web Interface: https://memegen.link

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.