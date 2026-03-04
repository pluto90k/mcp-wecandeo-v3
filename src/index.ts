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

// Connect the server to the transport
// Note: start() is a no-op for this transport, but we need to call connect
await server.connect(transport);

app.get("/", (c) => {
	return c.text("Wecandeo MCP Server (Web Standard)");
});

// All MCP requests (GET for SSE, POST for messages, DELETE for session)
app.all("/mcp", async (c) => {
	return transport.handleRequest(c.req.raw, {
		authInfo: c.env as any, // Pass environment variables via authInfo
	});
});

// Support legacy /sse and /message routes for compatibility if needed,
// but directing them to the same handler
app.all("/sse", async (c) => {
	return transport.handleRequest(c.req.raw, {
		authInfo: c.env as any,
	});
});

app.all("/message", async (c) => {
	return transport.handleRequest(c.req.raw, {
		authInfo: c.env as any,
	});
});

export default app;
