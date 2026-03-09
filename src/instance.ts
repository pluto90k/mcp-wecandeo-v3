import { serve } from "@hono/node-server";
import { Hono, type Context } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { setupServer } from "./server.js";

const PORT = parseInt(process.env.PORT ?? "3000", 10);
const INSTANCE_ACCESS_KEY = process.env.WECANDEO_ACCESS_KEY;

if (!INSTANCE_ACCESS_KEY) {
	console.error("Error: WECANDEO_ACCESS_KEY environment variable is required.");
	process.exit(1);
}

const app = new Hono();

app.get("/", (c) => {
	return c.text("Wecandeo MCP Server Running (Node.js Instance)");
});

app.get("/health", (c) => {
	return c.json({ status: "ok", port: PORT });
});

async function mcpHandler(c: Context): Promise<Response> {
	// Per-request key takes priority, fall back to instance-level env key
	const accessKey =
		c.req.header("X-Wecandeo-Access-Key") ||
		c.req.query("key") ||
		INSTANCE_ACCESS_KEY!;

	const server = new McpServer({
		name: "wecandeo-videopack-mcp",
		version: "1.0.0",
	});

	setupServer(server, accessKey);

	const transport = new WebStandardStreamableHTTPServerTransport({});
	await server.connect(transport);

	return transport.handleRequest(c.req.raw);
}

app.all("/mcp", mcpHandler);
app.all("/sse", mcpHandler);
app.all("/message", mcpHandler);

serve({ fetch: app.fetch, port: PORT }, (info) => {
	console.log(`Wecandeo MCP Server (Instance) listening on http://localhost:${info.port}`);
	console.log(`  /mcp     - Streamable HTTP MCP endpoint`);
	console.log(`  /sse     - SSE compatible endpoint`);
	console.log(`  /health  - Health check`);
});
