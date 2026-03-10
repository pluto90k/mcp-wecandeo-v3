import { WecandeoClient } from "../api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Package API Group Tools (24-30)
 */
export function registerPackageTools(server: McpServer, client: WecandeoClient) {
    const accessKey = client.getAccessKey();

    // -- Tools --

    // 24. Package List
    server.registerTool(
        "wecandeo_package_list",
        {
            description: "Retrieve list of all distribution packages.",
        },
        async () => {
            try {
                const result = await client.get("/info/v1/packages.json", { key: accessKey });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to list packages: ${error.message}` }]
                };
            }
        }
    );

    // 25. Publish All in Package
    server.registerTool(
        "wecandeo_package_publish_all",
        {
            description: "Start publishing all videos in a specific package.",
            inputSchema: {
                package_id: z.string().describe("Package ID"),
            },
        },
        async ({ package_id }) => {
            try {
                const result = await client.get("/info/v1/packages/all/publish.json", {
                    key: accessKey,
                    package_id,
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to publish all: ${error.message}` }]
                };
            }
        }
    );

    // 26. Unpublish All in Package
    server.registerTool(
        "wecandeo_package_unpublish_all",
        {
            description: "Pause publishing all videos in a specific package.",
            inputSchema: {
                package_id: z.string().describe("Package ID"),
            },
        },
        async ({ package_id }) => {
            try {
                const result = await client.get("/info/v1/packages/all/unpublish.json", {
                    key: accessKey,
                    package_id,
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to unpublish all: ${error.message}` }]
                };
            }
        }
    );

    // 27. Block Domain
    server.registerTool(
        "wecandeo_package_block_domain",
        {
            description: "Block specific domains from accessing a package.",
            inputSchema: {
                package_id: z.string().describe("Package ID"),
                domains: z.string().describe("Comma-separated list of domains to block"),
            },
        },
        async ({ package_id, domains }) => {
            try {
                const result = await client.get("/info/v1/packages/set/block/domain.json", {
                    key: accessKey,
                    package_id,
                    domains,
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to block domain: ${error.message}` }]
                };
            }
        }
    );

    // 28. Unblock Domain
    server.registerTool(
        "wecandeo_package_unblock_domain",
        {
            description: "Unblock specific domains for a package.",
            inputSchema: {
                package_id: z.string().describe("Package ID"),
                domains: z.string().describe("Comma-separated list of domains to unblock"),
            },
        },
        async ({ package_id, domains }) => {
            try {
                const result = await client.get("/info/v1/packages/set/unblock/domain.json", {
                    key: accessKey,
                    package_id,
                    domains,
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to unblock domain: ${error.message}` }]
                };
            }
        }
    );

    // 29. Playlists
    server.registerTool(
        "wecandeo_package_playlists",
        {
            description: "Retrieve list of playlists.",
        },
        async () => {
            try {
                const result = await client.get("/info/v1/playlist/list.json", { key: accessKey });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to list playlists: ${error.message}` }]
                };
            }
        }
    );

    // 30. Playlist Details
    server.registerTool(
        "wecandeo_package_playlist_details",
        {
            description: "Get details of a specific playlist.",
            inputSchema: {
                playlistKey: z.string().describe("Playlist Key"),
            },
        },
        async ({ playlistKey }) => {
            try {
                const result = await client.get("/info/v1/playlist.json", {
                    key: accessKey,
                    playlistKey,
                    access_key: accessKey,
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to get playlist details: ${error.message}` }]
                };
            }
        }
    );

    // -- Resources --

    // Resource: Packages
    server.registerResource(
        "packages",
        "wecandeo://packages",
        { description: "List of all distribution packages" },
        async (uri) => {
            const result = await client.get("/info/v1/packages.json", { key: accessKey });
            return {
                contents: [{
                    uri: uri.href,
                    text: JSON.stringify(result, null, 2),
                    mimeType: "application/json"
                }]
            };
        }
    );
}
