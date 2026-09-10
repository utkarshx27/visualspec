import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createVisualSpecServer } from "./server.js";

export async function runMcpServer() {
  const server = createVisualSpecServer();
  const transport = new StdioServerTransport();

  // Diagnostics must go to stderr, leaving stdout clean for JSON-RPC messages
  console.error("VisualSpec MCP Server starting on stdio...");
  await server.connect(transport);
  console.error("VisualSpec MCP Server running and ready for tool calls.");
}

// If run directly
const normalizedArgv = process.argv[1]?.replace(/\\/g, "/") || "";
const isDirectRun =
  normalizedArgv.endsWith("mcp/index.ts") ||
  normalizedArgv.endsWith("mcp/index.js");

if (isDirectRun) {
  runMcpServer().catch((err) => {
    console.error("Fatal error in VisualSpec MCP Server:", err);
    process.exit(1);
  });
}
