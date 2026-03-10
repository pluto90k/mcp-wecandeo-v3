import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WecandeoClient } from "./api/client.js";
import { registerUploadTools } from "./tools/upload.js";
import { registerVideoTools } from "./tools/video.js";
import { registerVideoUpdateTools } from "./tools/video_update.js";
import { registerPackageTools } from "./tools/package.js";
import { registerArchiveTools } from "./tools/archive.js";

/**
 * Configure and register all tools to an McpServer instance
 */
export function setupServer(server: McpServer, accessKey: string) {
	const client = new WecandeoClient(accessKey);

	registerUploadTools(server, client);
	registerVideoTools(server, client);
	registerVideoUpdateTools(server, client);
	registerPackageTools(server, client);
	registerArchiveTools(server, client);

	server.registerTool(
		"wecandeo_ping",
		{ description: "Check if the Wecandeo MCP server is responsive" },
		async () => ({
			content: [{ type: "text", text: "pong" }],
		})
	);
}
