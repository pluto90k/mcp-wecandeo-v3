import { Hono } from "hono";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { server } from "./mcp-server.js";

type Env = {
	WECANDEO_ACCESS_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

let transport: SSEServerTransport | null = null;

app.get("/", (c) => {
	return c.text("Wecandeo MCP Server (SSE)");
});

app.get("/sse", async (c) => {
	transport = new SSEServerTransport("/message", c.res.raw);
	await server.connect(transport);

	// Return a streaming response
	return new Response(null, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			"Connection": "keep-alive",
		},
	});
});

app.post("/message", async (c) => {
	if (!transport) {
		return c.text("No active SSE transport", 400);
	}
	await transport.handlePostMessage(c.req.raw, c.res.raw);
	return c.text("OK");
});

export default app;
