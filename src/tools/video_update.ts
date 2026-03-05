import { WecandeoClient } from "../api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Video Data Update API Group Tools (16-23)
 */
export function registerVideoUpdateTools(server: McpServer, client: WecandeoClient) {
    const accessKey = client.getAccessKey();

    // 16. Add Video to Package
    server.tool(
        "wecandeo_video_add_to_package",
        "Add a video to a specific distribution package.",
        {
            access_key: z.string().describe("Video access key"),
            pkg: z.string().describe("Package ID")
        },
        async ({ access_key, pkg }) => {
            const result = await client.get("/info/v1/video/set/package.json", {
                key: accessKey,
                access_key,
                pkg,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 17. Exclude Video from Package
    server.tool(
        "wecandeo_video_exclude_from_package",
        "Exclude a video from a specific distribution package.",
        {
            access_key: z.string().describe("Video access key"),
            pkg: z.string().describe("Package ID")
        },
        async ({ access_key, pkg }) => {
            const result = await client.get("/info/v1/video/set/exclude.json", {
                key: accessKey,
                access_key,
                pkg,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 18. Start Video Publish
    server.tool(
        "wecandeo_video_start_publish",
        "Start publishing a video in a specific package.",
        {
            access_key: z.string().describe("Video access key"),
            pkg: z.string().describe("Package ID")
        },
        async ({ access_key, pkg }) => {
            const result = await client.get("/info/v1/video/set/publish.json", {
                key: accessKey,
                access_key,
                pkg,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 19. Pause Video Publish
    server.tool(
        "wecandeo_video_pause_publish",
        "Pause publishing a video in a specific package.",
        {
            access_key: z.string().describe("Video access key"),
            pkg: z.string().describe("Package ID")
        },
        async ({ access_key, pkg }) => {
            const result = await client.get("/info/v1/video/set/pause.json", {
                key: accessKey,
                access_key,
                pkg,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 20. Modify Video Folder
    server.tool(
        "wecandeo_video_modify_folder",
        "Move a video to a different folder in the media archive.",
        {
            access_key: z.string().describe("Video access key"),
            folder: z.string().describe("Target folder ID")
        },
        async ({ access_key, folder }) => {
            const result = await client.get("/info/v1/video/set/folder.json", {
                key: accessKey,
                access_key,
                folder,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 21. Modify Video Meta Data
    server.tool(
        "wecandeo_video_modify_meta",
        "Modify metadata (title, tags, author, etc.) of a video.",
        {
            access_key: z.string().describe("Video access key"),
            title: z.string().optional().describe("Video title"),
            tag: z.string().optional().describe("Comma separated tags"),
            author: z.string().optional().describe("Author name"),
            series: z.string().optional().describe("Series name"),
            desc: z.string().optional().describe("Video description"),
        },
        async ({ access_key, ...params }) => {
            const queryParams: Record<string, string> = {
                key: accessKey,
                access_key,
            };
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined) queryParams[k] = v.toString();
            });
            const result = await client.get("/info/v1/video/set/detail.json", queryParams);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 22. Modify Video Extra Data (Viral)
    server.tool(
        "wecandeo_video_modify_extra",
        "Modify viral link and other extra metadata for a video.",
        {
            access_key: z.string().describe("Video access key"),
            enable: z.boolean().describe("Enable viral link"),
            viral_url: z.string().optional().describe("Viral link URL"),
            price: z.number().optional().describe("Price value"),
        },
        async ({ access_key, enable, ...params }) => {
            const result = await client.get("/info/v1/video/set/viral.json", {
                key: accessKey,
                access_key,
                enable: enable.toString(),
                ...params as any,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 23. Set Default Thumbnail
    server.tool(
        "wecandeo_video_set_default_thumbnail",
        "Set a specific thumbnail as the default for the video.",
        {
            access_key: z.string().describe("Video access key"),
            seq: z.number().describe("Thumbnail sequence number (1-6)")
        },
        async ({ access_key, seq }) => {
            const result = await client.get("/info/v1/video/set/thumbnail.json", {
                key: accessKey,
                access_key,
                seq: seq.toString(),
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );
}
