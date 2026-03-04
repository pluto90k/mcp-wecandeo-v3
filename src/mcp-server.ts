import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export const server = new McpServer({
    name: "wecandeo-videopack-mcp",
    version: "1.0.0",
});

// Register tools
import "./tools/upload.js";
import "./tools/video.js";
import "./tools/video_update.js";
import "./tools/package.js";
import "./tools/archive.js";

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
