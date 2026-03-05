#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WecandeoClient } from "./api/client.js";
import { registerUploadTools } from "./tools/upload.js";
import { registerVideoTools } from "./tools/video.js";
import { registerVideoUpdateTools } from "./tools/video_update.js";
import { registerPackageTools } from "./tools/package.js";
import { registerArchiveTools } from "./tools/archive.js";

async function main() {
	const accessKey = process.env.WECANDEO_ACCESS_KEY;
	if (!accessKey) {
		console.error("Error: WECANDEO_ACCESS_KEY environment variable is required.");
		console.error("Usage: WECANDEO_ACCESS_KEY=your_key npx wecandeo-mcp");
		process.exit(1);
	}

	const client = new WecandeoClient(accessKey);

	const server = new McpServer({
		name: "wecandeo-videopack-mcp",
		version: "1.0.0",
	});

	// Register all tool groups
	registerUploadTools(server, client);
	registerVideoTools(server, client);
	registerVideoUpdateTools(server, client);
	registerPackageTools(server, client);
	registerArchiveTools(server, client);

	// Ping tool for health check
	server.tool(
		"ping",
		"Check if the Wecandeo MCP server is responsive",
		{},
		async () => ({
			content: [{ type: "text", text: "pong" }],
		})
	);

	// Connect via stdio
	const transport = new StdioServerTransport();
	await server.connect(transport);

	console.error("Wecandeo MCP Server started (stdio mode)");
}

main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
