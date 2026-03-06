import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

/**
 * Silent Bridge: SSE (Remote) -> Stdio (Antigravity)
 * This script connects to a remote MCP SSE server and provides a Stdio interface.
 * It ensures NO non-JSON text is printed to stdout.
 */
async function main() {
    const url = process.argv[2];
    if (!url) {
        process.stderr.write("Usage: node bridge.js <SSE_URL>\n");
        process.exit(1);
    }

    // Suppress any accidental stdout from libraries
    const stdoutWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk, encoding, callback) => {
        if (typeof chunk === 'string' && (chunk.startsWith('{') || chunk.startsWith('['))) {
            return stdoutWrite(chunk, encoding, callback);
        }
        if (Buffer.isBuffer(chunk) && (chunk[0] === 123 || chunk[0] === 91)) { // '{' or '['
            return stdoutWrite(chunk, encoding, callback);
        }
        return process.stderr.write(chunk, encoding, callback);
    };

    try {
        const client = new Client(
            { name: "wecandeo-bridge", version: "1.0.0" },
            { capabilities: { tools: {}, resources: {} } }
        );

        const transport = new SSEClientTransport(new URL(url));
        await client.connect(transport);

        const serverTransport = new StdioServerTransport();

        // Bridge logic: Forward all requests from Antigravity (stdio) to Worker (SSE)
        // Since the SDK doesn't have a built-in "Server-to-Client-Pipe", 
        // we manually handle the JSON-RPC flow if needed, 
        // but a simpler way is to use the transport directly if compatible.

        // For a true bridge, we need to listen to serverTransport and call client.request
        // However, it's easier to use a specialized bridge if we can find one that's silent.
        // Let's use a more robust implementation.

        process.stderr.write(`Connected to ${url}\n`);

        // Manual piping of JSON-RPC
        serverTransport.onmessage = async (message) => {
            try {
                const response = await client.request(message.method, message.params);
                await serverTransport.send({
                    jsonrpc: "2.0",
                    id: message.id,
                    result: response
                });
            } catch (error) {
                await serverTransport.send({
                    jsonrpc: "2.0",
                    id: message.id,
                    error: { code: -32603, message: error.message }
                });
            }
        };

        await serverTransport.start();

    } catch (error) {
        process.stderr.write(`Bridge Error: ${error.message}\n`);
        process.exit(1);
    }
}

main();
