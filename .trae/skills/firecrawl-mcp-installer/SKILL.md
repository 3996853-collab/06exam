---
name: "firecrawl-mcp-installer"
description: "Installs Firecrawl MCP for web scraping and crawling. Invoke when user needs Firecrawl MCP or wants to enable web page extraction capabilities."
---

# Firecrawl MCP Installer

This skill installs and configures Firecrawl MCP for web scraping, crawling, and content extraction.

## What is Firecrawl MCP

Firecrawl MCP provides:
- Web page crawling and scraping
- URL to Markdown conversion
- Website content extraction
- Sitemap discovery and crawling

## Installation Steps

1. **Install via npm** (recommended):
   ```bash
   npm install -g @firecrawl/mcp
   ```

2. **Or install via npx** (no installation required):
   ```bash
   npx -y @firecrawl/mcp
   ```

3. **Configure in MCP Client**:
   
   Add to your MCP configuration (e.g., in `claude_desktop_config.json` or IDE settings):
   
   ```json
   {
     "mcpServers": {
       "firecrawl": {
         "command": "npx",
         "args": ["-y", "@firecrawl/mcp"],
         "env": {
           "FIRECRAWL_API_KEY": "your-api-key-here"
         }
       }
     }
   }
   ```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FIRECRAWL_API_KEY` | Your Firecrawl API key | Yes (for cloud) |
| `FIRECRAWL_BASE_URL` | Self-hosted Firecrawl URL | No (optional) |

### Getting API Key

1. Visit [firecrawl.dev](https://www.firecrawl.dev)
2. Sign up for an account
3. Navigate to API settings
4. Generate your API key

## Usage

Once installed, you can use Firecrawl MCP to:
- Crawl websites and extract content
- Convert URLs to Markdown
- Discover sitemaps
- Scrape web pages with structured data

## Verification

To verify installation:
```bash
npx @firecrawl/mcp --version
```

## Troubleshooting

- **Permission errors**: Try running with `sudo` or check npm global permissions
- **API errors**: Verify your FIRECRAWL_API_KEY is correct
- **Connection issues**: Check firewall settings and network connectivity
