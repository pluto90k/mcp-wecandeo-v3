import { Hono } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WecandeoClient } from "./api/client.js";
import { registerUploadTools } from "./tools/upload.js";
import { registerVideoTools } from "./tools/video.js";
import { registerVideoUpdateTools } from "./tools/video_update.js";
import { registerPackageTools } from "./tools/package.js";
import { registerArchiveTools } from "./tools/archive.js";

/**
 * Configure and register all tools to an McpServer
 */
function setupServer(server: McpServer, accessKey: string) {
	const client = new WecandeoClient(accessKey);

	registerUploadTools(server, client);
	registerVideoTools(server, client);
	registerVideoUpdateTools(server, client);
	registerPackageTools(server, client);
	registerArchiveTools(server, client);

	server.tool(
		"wecandeo_ping",
		"Check if the Wecandeo MCP server is responsive",
		{},
		async () => ({
			content: [{ type: "text", text: "pong" }],
		})
	);
}

// 1. Node.js CLI Handling (Stdio)
const isNode = typeof process !== "undefined" && process.versions && process.versions.node;
if (isNode) {
	const accessKey = process.env.WECANDEO_ACCESS_KEY;
	if (!accessKey) {
		console.error("Error: WECANDEO_ACCESS_KEY environment variable is required.");
		process.exit(1);
	}

	const server = new McpServer({
		name: "wecandeo-videopack-mcp",
		version: "1.0.0",
	});

	setupServer(server, accessKey);

	const transport = new StdioServerTransport();
	server.connect(transport).catch((err) => {
		console.error("Failed to connect to Stdio transport:", err);
		process.exit(1);
	});
}

// 2. Cloudflare Worker Handling (HTTP)
type Env = {
	WECANDEO_ACCESS_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => {
	return c.text("Wecandeo MCP Server Running (Cloudflare Worker)");
});

// Stateless MCP Handler for Cloudflare
app.all("/mcp", async (c) => {
	const accessKey = c.req.header("X-Wecandeo-Access-Key") || c.req.query("key");

	if (!accessKey) {
		return c.json({
			error: "Unauthorized",
			message: "X-Wecandeo-Access-Key header is required for user-specific authentication."
		}, 401);
	}

	const server = new McpServer({
		name: "wecandeo-videopack-mcp",
		version: "1.0.0",
	});

	setupServer(server, accessKey);

	const transport = new WebStandardStreamableHTTPServerTransport({});
	await server.connect(transport);

	return transport.handleRequest(c.req.raw, { authInfo: c.env as any });
});

// SSE compatibility
app.all("/sse", async (c) => {
	const accessKey = c.req.header("X-Wecandeo-Access-Key") || c.req.query("key");
	if (!accessKey) return c.json({ error: "Unauthorized" }, 401);

	const server = new McpServer({ name: "wecandeo-videopack-mcp", version: "1.0.0" });
	setupServer(server, accessKey);
	const transport = new WebStandardStreamableHTTPServerTransport({});
	await server.connect(transport);
	return transport.handleRequest(c.req.raw, { authInfo: c.env as any });
});

app.all("/message", async (c) => {
	const accessKey = c.req.header("X-Wecandeo-Access-Key") || c.req.query("key");
	if (!accessKey) return c.json({ error: "Unauthorized" }, 401);

	const server = new McpServer({ name: "wecandeo-videopack-mcp", version: "1.0.0" });
	setupServer(server, accessKey);
	const transport = new WebStandardStreamableHTTPServerTransport({});
	await server.connect(transport);
	return transport.handleRequest(c.req.raw, { authInfo: c.env as any });
});

export default app;
