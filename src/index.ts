import { Hono } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerUploadTools } from "./tools/upload.js";
import { registerVideoTools } from "./tools/video.js";
import { registerVideoUpdateTools } from "./tools/video_update.js";
import { registerPackageTools } from "./tools/package.js";
import { registerArchiveTools } from "./tools/archive.js";

type Env = {
	WECANDEO_ACCESS_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

// Factory function to create a new, fully initialized server and transport for each request
async function createServerAndTransport() {
	const server = new McpServer({
		name: "wecandeo-videopack-mcp",
		version: "1.0.0",
	});

	// Register all tools
	registerUploadTools(server);
	registerVideoTools(server);
	registerVideoUpdateTools(server);
	registerPackageTools(server);
	registerArchiveTools(server);

	server.tool(
		"ping",
		"Check if the Wecandeo MCP server is responsive",
		{},
		async () => ({
			content: [{ type: "text", text: "pong" }],
		})
	);

	// Stateless transport
	const transport = new WebStandardStreamableHTTPServerTransport({});
	await server.connect(transport);

	return { server, transport };
}

app.get("/", (c) => {
	return c.text("Wecandeo MCP Server (Web Standard, Stateless) - Running");
});

// All MCP requests
app.all("/mcp", async (c) => {
	console.log(`MCP Request: ${c.req.method} ${c.req.url}`);
	try {
		const { transport } = await createServerAndTransport();
		return transport.handleRequest(c.req.raw, {
			authInfo: c.env as any,
		});
	} catch (error: any) {
		console.error("MCP Handler Error:", error);
		return c.json({
			jsonrpc: "2.0",
			error: {
				code: -32000,
				message: `Server failed to start: ${error.message}`
			}
		}, 500);
	}
});

// Compatibility routes
app.all("/sse", async (c) => {
	try {
		const { transport } = await createServerAndTransport();
		return transport.handleRequest(c.req.raw, { authInfo: c.env as any });
	} catch (error: any) {
		return c.json({ error: error.message }, 500);
	}
});

app.all("/message", async (c) => {
	try {
		const { transport } = await createServerAndTransport();
		return transport.handleRequest(c.req.raw, { authInfo: c.env as any });
	} catch (error: any) {
		return c.json({ error: error.message }, 500);
	}
});

export default app;
