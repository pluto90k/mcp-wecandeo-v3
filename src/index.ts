import { Hono } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { setupServer } from "./server.js";

// 1. Node.js CLI Handling (Stdio)
// Check both process existence and stdin/stdout to avoid false positives in Worker environments with nodejs_compat
const isNodeCLI = typeof process !== "undefined" &&
	process.versions &&
	process.versions.node &&
	process.stdin &&
	process.stdout &&
	!((globalThis as any).caches); // Cloudflare Workers usually have 'caches' global

if (isNodeCLI) {
	const args = process.argv.slice(2);
	const remoteIndex = args.indexOf('--remote');

	if (remoteIndex !== -1 && args[remoteIndex + 1]) {
		// --- 1a. Remote Bridge Mode (Stdio -> Cloudflare Streamable HTTP) ---
		// Automatically handled when user runs: npx @pluto90/wecandeo-v3 --remote <URL>
		const url = args[remoteIndex + 1];

		// Suppress accidental stdout logs to ensure Antigravity parses exactly JSON
		const stdoutWrite = process.stdout.write.bind(process.stdout);
		process.stdout.write = (chunk: any, encoding?: any, callback?: any) => {
			if (typeof chunk === 'string' && (chunk.startsWith('{') || chunk.startsWith('['))) {
				return stdoutWrite(chunk, encoding, callback);
			}
			if (Buffer.isBuffer(chunk) && (chunk[0] === 123 || chunk[0] === 91)) {
				return stdoutWrite(chunk, encoding, callback);
			}
			return process.stderr.write(chunk, encoding, callback);
		};

		async function runBridge() {
			try {
				// We use a custom fetch routing since standard ClientTransports have mismatching stream paradigms.
				// We pipe StdioServerTransport -> HTTP POST -> StdioServerTransport
				const serverTransport = new StdioServerTransport();

				serverTransport.onmessage = async (message) => {
					try {
						// Streamable HTTP standard: POST directly to the unified endpoint
						const res = await fetch(url, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								'Accept': 'application/json, text/event-stream'
							},
							body: JSON.stringify(message)
						});

						if (!res.ok) {
							throw new Error(`Cloudflare Worker HTTP Error: ${res.status}`);
						}

						// Our Streamable HTTP Server responds directly with the JSON-RPC response chunks or whole body
						const responseText = await res.text();

						// Fallback parser since body might be SSE chunks or pure JSON depending on the SDK state
						if (responseText.startsWith('event:')) {
							const lines = responseText.split('\n');
							for (const line of lines) {
								if (line.startsWith('data: ')) {
									const dataStr = line.replace('data: ', '').trim();
									if (dataStr) {
										await serverTransport.send(JSON.parse(dataStr));
									}
								}
							}
						} else if (responseText.trim().startsWith('{')) {
							await serverTransport.send(JSON.parse(responseText));
						} else {
							throw new Error('Unrecognized response format from server');
						}

					} catch (error: any) {
						if ('id' in message && message.id !== undefined) {
							await serverTransport.send({
								jsonrpc: "2.0",
								id: message.id,
								error: { code: -32603, message: error.message }
							});
						}
					}
				};

				await serverTransport.start();
				process.stderr.write(`Connected securely to Cloudflare MCP Worker: ${url}\n`);
			} catch (error: any) {
				process.stderr.write(`Bridge initialization failed: ${error.message}\n`);
				process.exit(1);
			}
		}

		runBridge();

	} else {
		// --- 1b. Standard Native CLI Mode ---
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
