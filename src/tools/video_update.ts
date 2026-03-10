import { WecandeoClient } from "../api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Video Data Update API Group Tools (16-23)
 */
export function registerVideoUpdateTools(server: McpServer, client: WecandeoClient) {
    const accessKey = client.getAccessKey();

    // 16. Add Video to Package
    server.registerTool(
        "wecandeo_video_add_to_package",
        {
            description: "Add a video to a specific distribution package.",
            inputSchema: {
                access_key: z.string().describe("Video access key"),
                pkg: z.string().describe("Package ID"),
            },
        },
        async ({ access_key, pkg }) => {
            try {
                const result = await client.get("/info/v1/video/set/package.json", {
                    key: accessKey,
                    access_key,
                    pkg,
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to add video to package: ${error.message}` }]
                };
            }
        }
    );

    // 17. Exclude Video from Package
    server.registerTool(
        "wecandeo_video_exclude_from_package",
        {
            description: "Exclude a video from a specific distribution package.",
            inputSchema: {
                access_key: z.string().describe("Video access key"),
                pkg: z.string().describe("Package ID"),
            },
        },
        async ({ access_key, pkg }) => {
            try {
                const result = await client.get("/info/v1/video/set/exclude.json", {
                    key: accessKey,
                    access_key,
                    pkg,
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to exclude video from package: ${error.message}` }]
                };
            }
        }
    );

    // 18. Start Video Publish
    server.registerTool(
        "wecandeo_video_start_publish",
        {
            description: "Start publishing a video in a specific package.",
            inputSchema: {
                access_key: z.string().describe("Video access key"),
                pkg: z.string().describe("Package ID"),
            },
        },
        async ({ access_key, pkg }) => {
            try {
                const result = await client.get("/info/v1/video/set/publish.json", {
                    key: accessKey,
                    access_key,
                    pkg,
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to start publish: ${error.message}` }]
                };
            }
        }
    );

    // 19. Pause Video Publish
    server.registerTool(
        "wecandeo_video_pause_publish",
        {
            description: "Pause publishing a video in a specific package.",
            inputSchema: {
                access_key: z.string().describe("Video access key"),
                pkg: z.string().describe("Package ID"),
            },
        },
        async ({ access_key, pkg }) => {
            try {
                const result = await client.get("/info/v1/video/set/pause.json", {
                    key: accessKey,
                    access_key,
                    pkg,
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to pause publish: ${error.message}` }]
                };
            }
        }
    );

    // 20. Modify Video Folder
    server.registerTool(
        "wecandeo_video_modify_folder",
        {
            description: "Move a video to a different folder in the media archive. Requires the target folder ID.",
            inputSchema: {
                access_key: z.string().describe("Video access key"),
                folder: z.string().describe("Target folder ID"),
            },
        },
        async ({ access_key, folder }) => {
            try {
                const result = await client.get("/info/v1/video/set/folder.json", {
                    key: accessKey,
                    access_key,
                    folder,
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to modify folder: ${error.message}` }]
                };
            }
        }
    );

    // 21. Modify Video Meta Data
    server.registerTool(
        "wecandeo_video_modify_meta",
        {
            description: "Modify metadata (title, tags, author, etc.) of a video.",
            inputSchema: {
                access_key: z.string().describe("Video access key"),
                title: z.string().optional().describe("Video title"),
                tag: z.string().optional().describe("Comma separated tags"),
                author: z.string().optional().describe("Author name"),
                series: z.string().optional().describe("Series name"),
                desc: z.string().optional().describe("Video description"),
            },
        },
        async ({ access_key, ...params }) => {
            try {
                const queryParams: Record<string, string> = {
                    key: accessKey,
                    access_key,
                };
                Object.entries(params).forEach(([k, v]) => {
                    if (v !== undefined) queryParams[k] = v.toString();
                });
                const result = await client.get("/info/v1/video/set/detail.json", queryParams);
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to modify metadata: ${error.message}` }]
                };
            }
        }
    );

    // 22. Modify Video Extra Data (Viral)
    server.registerTool(
        "wecandeo_video_modify_extra",
        {
            description: "Modify viral link and other extra metadata for a video.",
            inputSchema: {
                access_key: z.string().describe("Video access key"),
                enable: z.boolean().describe("Enable viral link"),
                viral_url: z.string().optional().describe("Viral link URL"),
                price: z.number().optional().describe("Price value"),
            },
        },
        async ({ access_key, enable, ...params }) => {
            try {
                const result = await client.get("/info/v1/video/set/viral.json", {
                    key: accessKey,
                    access_key,
                    enable: enable.toString(),
                    ...params as any,
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to modify extra data: ${error.message}` }]
                };
            }
        }
    );

    // 23. Set Default Thumbnail
    server.registerTool(
        "wecandeo_video_set_default_thumbnail",
        {
            description: "Set a specific thumbnail as the default for the video.",
            inputSchema: {
                access_key: z.string().describe("Video access key"),
                seq: z.number().describe("Thumbnail sequence number (1-6)"),
            },
        },
        async ({ access_key, seq }) => {
            try {
                const result = await client.get("/info/v1/video/set/thumbnail.json", {
                    key: accessKey,
                    access_key,
                    seq: seq.toString(),
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to set thumbnail: ${error.message}` }]
                };
            }
        }
    );
}
