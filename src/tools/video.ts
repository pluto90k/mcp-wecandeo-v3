import { WecandeoClient } from "../api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Video Data Retrieve API Group Tools (8-15)
 */
export function registerVideoTools(server: McpServer, client: WecandeoClient) {
    const accessKey = client.getAccessKey();

    // 8. Video List (Package)
    server.tool(
        "wecandeo_video_list_package",
        "Retrieve video list filtered by package ID.",
        { pkg: z.string().describe("Package ID") },
        async ({ pkg }) => {
            const result = await client.get("/info/v1/videos.json", {
                key: accessKey,
                pkg,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 9. Video List (Folder)
    server.tool(
        "wecandeo_video_list_folder",
        "Retrieve video list filtered by folder ID.",
        { folder: z.string().describe("Folder ID") },
        async ({ folder }) => {
            const result = await client.get("/info/v1/folder/videos.json", {
                key: accessKey,
                folder,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 10. Video Details
    server.tool(
        "wecandeo_video_details",
        "Get detailed information of a specific video.",
        {
            access_key: z.string().describe("Video access key"),
            pkg: z.string().describe("Package ID")
        },
        async ({ access_key, pkg }) => {
            const result = await client.get("/info/v1/video/detail.json", {
                key: accessKey,
                access_key,
                pkg,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 11. Video Pub Code (Publish Info)
    server.tool(
        "wecandeo_video_pub_code",
        "Get publish info and player codes for a video.",
        {
            access_key: z.string().describe("Video access key"),
            pkg: z.string().describe("Package ID")
        },
        async ({ access_key, pkg }) => {
            const result = await client.get("/info/v1/video/publishInfo.json", {
                key: accessKey,
                access_key,
                pkg,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 12. Video Encoded Files
    server.tool(
        "wecandeo_video_encoded_file",
        "Retrieve list of encoded files for a video.",
        {
            access_key: z.string().describe("Video access key"),
            pkg: z.string().describe("Package ID")
        },
        async ({ access_key, pkg }) => {
            const result = await client.get("/info/v1/video/encodingFiles.json", {
                key: accessKey,
                access_key,
                pkg,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 13. Video One-time Key
    server.tool(
        "wecandeo_video_onetime_key",
        "Generate a one-time access key for a video.",
        {
            access_key: z.string().describe("Video access key"),
            expire: z.number().describe("Expiration time in seconds")
        },
        async ({ access_key, expire }) => {
            const result = await client.get("/info/auth/accessKey.json", {
                key: accessKey,
                access_key,
                expire: expire.toString(),
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 14. Video Thumbnails
    server.tool(
        "wecandeo_video_thumbnail",
        "Retrieve thumbnail image info for a video.",
        { access_key: z.string().describe("Video access key") },
        async ({ access_key }) => {
            const result = await client.get("/info/v2/video/thumbnails.json", {
                key: accessKey,
                access_key,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 15. Video Caption
    server.tool(
        "wecandeo_video_caption",
        "Retrieve caption file info for a video.",
        { access_key: z.string().describe("Video access key") },
        async ({ access_key }) => {
            const result = await client.get("/info/v1/video/caption.json", {
                key: accessKey,
                access_key,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );
}
