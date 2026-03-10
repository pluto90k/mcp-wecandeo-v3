import { WecandeoClient } from "../api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Video Data Retrieve API Group Tools (8-15)
 */
export function registerVideoTools(server: McpServer, client: WecandeoClient) {
    const accessKey = client.getAccessKey();

    // 8. Video List (Package)
    server.registerTool(
        "wecandeo_video_list_package",
        {
            description: "List videos in a specific distribution package. Requires a package ID. Use this to find videos by package, NOT to list packages or folders.",
            inputSchema: {
                pkg: z.string().describe("Package ID"),
            },
        },
        async ({ pkg }) => {
            try {
                const result = await client.get("/info/v1/videos.json", {
                    key: accessKey,
                    pkg,
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to list videos in package: ${error.message}` }]
                };
            }
        }
    );

    // 9. Video List (Folder)
    server.registerTool(
        "wecandeo_video_list_folder",
        {
            description: "List videos (영상 목록) inside a specific folder. Requires a folder ID parameter — cannot be called without one. Do NOT use this to list folders; use wecandeo_archive_list_folders instead.",
            inputSchema: {
                folder: z.string().describe("Folder ID"),
            },
        },
        async ({ folder }) => {
            try {
                const result = await client.get("/info/v1/folder/videos.json", {
                    key: accessKey,
                    folder,
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to list videos in folder: ${error.message}` }]
                };
            }
        }
    );

    // 10. Video Details
    server.registerTool(
        "wecandeo_video_details",
        {
            description: "Get detailed information of a specific video.",
            inputSchema: {
                access_key: z.string().describe("Video access key"),
                pkg: z.string().describe("Package ID"),
            },
        },
        async ({ access_key, pkg }) => {
            try {
                const result = await client.get("/info/v1/video/detail.json", {
                    key: accessKey,
                    access_key,
                    pkg,
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to get video details: ${error.message}` }]
                };
            }
        }
    );

    // 11. Video Pub Code (Publish Info)
    server.registerTool(
        "wecandeo_video_pub_code",
        {
            description: "Get publish info and player codes for a video.",
            inputSchema: {
                access_key: z.string().describe("Video access key"),
                pkg: z.string().describe("Package ID"),
            },
        },
        async ({ access_key, pkg }) => {
            try {
                const result = await client.get("/info/v1/video/publishInfo.json", {
                    key: accessKey,
                    access_key,
                    pkg,
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to get publish info: ${error.message}` }]
                };
            }
        }
    );

    // 12. Video Encoded Files
    server.registerTool(
        "wecandeo_video_encoded_file",
        {
            description: "Retrieve list of encoded files for a video.",
            inputSchema: {
                access_key: z.string().describe("Video access key"),
                pkg: z.string().describe("Package ID"),
            },
        },
        async ({ access_key, pkg }) => {
            try {
                const result = await client.get("/info/v1/video/encodingFiles.json", {
                    key: accessKey,
                    access_key,
                    pkg,
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to get encoded files: ${error.message}` }]
                };
            }
        }
    );

    // 13. Video One-time Key
    server.registerTool(
        "wecandeo_video_onetime_key",
        {
            description: "Generate a one-time access key for a video.",
            inputSchema: {
                access_key: z.string().describe("Video access key"),
                expire: z.number().describe("Expiration time in seconds"),
            },
        },
        async ({ access_key, expire }) => {
            try {
                const result = await client.get("/info/auth/accessKey.json", {
                    key: accessKey,
                    access_key,
                    expire: expire.toString(),
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to generate one-time key: ${error.message}` }]
                };
            }
        }
    );

    // 14. Video Thumbnails
    server.registerTool(
        "wecandeo_video_thumbnail",
        {
            description: "Retrieve thumbnail image info for a video.",
            inputSchema: {
                access_key: z.string().describe("Video access key"),
            },
        },
        async ({ access_key }) => {
            try {
                const result = await client.get("/info/v2/video/thumbnails.json", {
                    key: accessKey,
                    access_key,
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to get thumbnails: ${error.message}` }]
                };
            }
        }
    );

    // 15. Video Caption
    server.registerTool(
        "wecandeo_video_caption",
        {
            description: "Retrieve caption file info for a video.",
            inputSchema: {
                access_key: z.string().describe("Video access key"),
            },
        },
        async ({ access_key }) => {
            try {
                const result = await client.get("/info/v1/video/caption.json", {
                    key: accessKey,
                    access_key,
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to get captions: ${error.message}` }]
                };
            }
        }
    );
}
