import { Hono } from "hono";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { server } from "./mcp-server.js";

type Env = {
	WECANDEO_ACCESS_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

const transport = new WebStandardStreamableHTTPServerTransport({
	sessionIdGenerator: () => crypto.randomUUID(),
});

let isInitialized = false;

async function ensureInitialized() {
	if (!isInitialized) {
		await server.connect(transport);
		isInitialized = true;
	}
}

app.get("/", (c) => {
	return c.text("Wecandeo MCP Server (Web Standard)");
});

// All MCP requests (GET for SSE, POST for messages, DELETE for session)
app.all("/mcp", async (c) => {
	await ensureInitialized();
	return transport.handleRequest(c.req.raw, {
		authInfo: c.env as any,
	});
});

// Support legacy /sse and /message routes for compatibility if needed,
// but directing them to the same handler
app.all("/sse", async (c) => {
	await ensureInitialized();
	return transport.handleRequest(c.req.raw, {
		authInfo: c.env as any,
	});
});

app.all("/message", async (c) => {
	await ensureInitialized();
	return transport.handleRequest(c.req.raw, {
		authInfo: c.env as any,
	});
});

export default app;
