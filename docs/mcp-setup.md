# VisualSpec MCP Server Setup Guide

VisualSpec includes a native **Model Context Protocol (MCP)** server, allowing AI coding assistants and agents (Cursor, Claude Code, Gemini CLI, Antigravity IDE) to generate, validate, render, and repair visual graphics directly via tool calls.

---

## 🛠 Available MCP Tools

| Tool | Description |
|---|---|
| `visual_brief_to_spec` | Converts chat instructions into structured VisualSpec YAML. |
| `visual_validate_spec` | Validates a VisualSpec against the official schema. |
| `visual_render` | Deterministic rendering of typography and layout (zero API key). |
| `visual_generate` | Full generative pipeline (model adapter + layout + QA). |
| `visual_check_qa` | Evaluates safe margins, line counts, dimensions, and exact text invariants. |
| `visual_repair` | Diagnoses QA violations and automatically applies localized fixes. |
| `visual_list_resources`| Lists all supported platforms, aspect ratios, and template archetypes. |

---

## 🔌 Configuration

### 1. Cursor Setup

Add the server to your Cursor MCP settings in `.cursor/mcp.json` (or via Cursor Settings -> Features -> MCP):

```json
{
  "mcpServers": {
    "visualspec": {
      "command": "node",
      "args": ["/path/to/visualspec/dist/mcp/index.js"]
    }
  }
}
```

Or using `npx`:

```json
{
  "mcpServers": {
    "visualspec": {
      "command": "npx",
      "args": ["-y", "@utkarshx27/visualspec", "mcp"]
    }
  }
}
```

---

### 2. Claude Desktop Setup

In `claude_desktop_config.json`:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "visualspec": {
      "command": "node",
      "args": ["/path/to/visualspec/dist/mcp/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-openai-key-optional",
        "GEMINI_API_KEY": "your-gemini-key-optional"
      }
    }
  }
}
```

---

### 3. Antigravity IDE Setup

In your workspace `.agents/mcp_config.json`:

```json
{
  "mcpServers": {
    "visualspec": {
      "command": "node",
      "args": ["${workspaceFolder}/dist/mcp/index.js"]
    }
  }
}
```

---

### 4. Running Manually from CLI

You can also test the stdio server directly:

```bash
# Via npm script
npm run mcp

# Via CLI
npx visual mcp
```

Or inspect tools interactively using the official MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/mcp/index.js
```
