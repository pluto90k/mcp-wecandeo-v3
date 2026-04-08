import { WecandeoClient } from "../api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Package API Group Tools (24-30)
 */
export function registerPackageTools(server: McpServer, client: WecandeoClient) {
    const apiKey = client.getApiKey();

    // 24. Package List
    server.tool(
        "wecandeo_package_list",
        "Retrieve list of all distribution packages.",
        {},
        async () => {
            const result = await client.get("/info/v1/packages.json", {
                key: apiKey,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 25. Publish All in Package
    server.tool(
        "wecandeo_package_publish_all",
        "Start publishing all videos in a specific package.",
        { package_id: z.string().describe("Package ID") },
        async ({ package_id }) => {
            const result = await client.get("/info/v1/packages/all/publish.json", {
                key: apiKey,
                package_id,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 26. Unpublish All in Package
    server.tool(
        "wecandeo_package_unpublish_all",
        "Pause publishing all videos in a specific package.",
        { package_id: z.string().describe("Package ID") },
        async ({ package_id }) => {
            const result = await client.get("/info/v1/packages/all/unpublish.json", {
                key: apiKey,
                package_id,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 27. Block Domain
    server.tool(
        "wecandeo_package_block_domain",
        "Block specific domains from accessing a package.",
        {
            package_id: z.string().describe("Package ID"),
            domains: z.string().describe("Comma-separated list of domains to block")
        },
        async ({ package_id, domains }) => {
            const result = await client.get("/info/v1/packages/set/block/domain.json", {
                key: apiKey,
                package_id,
                domains,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 28. Unblock Domain
    server.tool(
        "wecandeo_package_unblock_domain",
        "Unblock specific domains for a package.",
        {
            package_id: z.string().describe("Package ID"),
            domains: z.string().describe("Comma-separated list of domains to unblock")
        },
        async ({ package_id, domains }) => {
            const result = await client.get("/info/v1/packages/set/unblock/domain.json", {
                key: apiKey,
                package_id,
                domains,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 29. Playlists
    server.tool(
        "wecandeo_package_playlists",
        "Retrieve list of playlists.",
        {},
        async () => {
            const result = await client.get("/info/v1/playlist/list.json", {
                key: apiKey,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 30. Playlist Details
    server.tool(
        "wecandeo_package_playlist_details",
        "Get details of a specific playlist.",
        { playlistKey: z.string().describe("Playlist Key") },
        async ({ playlistKey }) => {
            const result = await client.get("/info/v1/playlist.json", {
                key: apiKey,
                playlistKey,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );
}
