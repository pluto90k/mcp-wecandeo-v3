import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { registerUploadTools } from "./tools/upload.js";
import { registerVideoTools } from "./tools/video.js";
import { registerVideoUpdateTools } from "./tools/video_update.js";
import { registerPackageTools } from "./tools/package.js";
import { registerArchiveTools } from "./tools/archive.js";

export const server = new McpServer({
    name: "wecandeo-videopack-mcp",
    version: "1.0.0",
});

// Register tools
registerUploadTools(server);
registerVideoTools(server);
registerVideoUpdateTools(server);
registerPackageTools(server);
registerArchiveTools(server);

// Example tool:
server.tool(
    "ping",
    "Check if the Wecandeo MCP server is responsive",
    {},
    async () => {
        return {
            content: [
                {
                    type: "text",
                    text: "pong",
                },
            ],
        };
    }
);
