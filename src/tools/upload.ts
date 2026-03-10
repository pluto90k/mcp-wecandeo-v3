import { WecandeoClient } from "../api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Upload API Group Tools (1-7)
 */
export function registerUploadTools(server: McpServer, client: WecandeoClient) {
    const accessKey = client.getAccessKey();

    // 1. Create Upload Ticket (Token)
    server.registerTool(
        "wecandeo_upload_create_ticket",
        {
            description: "Create an upload ticket (token) for video uploading. Returns uploadUrl and token.",
        },
        async () => {
            try {
                const result = await client.get("/web/v3/uploadToken.json", {
                    key: accessKey,
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to create upload ticket: ${error.message}` }]
                };
            }
        }
    );

    // 2. Upload Video File
    server.registerTool(
        "wecandeo_upload_video",
        {
            description: "Upload a video file to Wecandeo using a sourceUrl.",
            inputSchema: {
                uploadUrl: z.string().describe("The upload URL obtained from create_ticket"),
                token: z.string().describe("The upload token obtained from create_ticket"),
                sourceUrl: z.string().describe("The external URL of the video file to be uploaded"),
                folder: z.string().describe("Target folder ID in media archive"),
                title: z.string().optional().describe("Video title"),
            },
        },
        async ({ uploadUrl, token, sourceUrl, folder, title }) => {
            try {
                const isLocalFile = !sourceUrl.startsWith("http://") && !sourceUrl.startsWith("https://");
                let blob: Blob;
                let fileName: string;

                if (isLocalFile) {
                    try {
                        const fs = await import("node:fs/promises");
                        const path = await import("node:path");
                        const buffer = await fs.readFile(sourceUrl);
                        blob = new Blob([buffer]);
                        fileName = path.basename(sourceUrl);
                    } catch (err: any) {
                        return {
                            isError: true,
                            content: [{ type: "text", text: `Error: Cannot read local file (might not be supported in this environment): ${err.message}` }],
                        };
                    }
                } else {
                    try {
                        const headResponse = await fetch(sourceUrl, { method: "HEAD" });
                        if (!headResponse.ok) {
                            return {
                                isError: true,
                                content: [{ type: "text", text: `Error: sourceUrl is not accessible (${headResponse.status} ${headResponse.statusText}). Please check the URL.` }],
                            };
                        }

                        const fileResponse = await fetch(sourceUrl);
                        if (!fileResponse.ok) throw new Error(`Source fetch failed: ${fileResponse.statusText}`);
                        blob = await fileResponse.blob();

                        try {
                            const url = new URL(sourceUrl);
                            fileName = url.pathname.split('/').pop() || "video.mp4";
                        } catch {
                            fileName = "video.mp4";
                        }
                    } catch (err: any) {
                        return {
                            isError: true,
                            content: [{ type: "text", text: `Error: Failed to fetch source URL: ${err.message}` }],
                        };
                    }
                }

                const formData = new FormData();
                formData.append("token", token);
                formData.append("folder", folder);
                if (title) formData.append("title", title);
                formData.append("videofile", blob, fileName);

                const uploadResponse = await fetch(`${uploadUrl}?token=${token}`, {
                    method: "POST",
                    body: formData
                });

                const result = await uploadResponse.json();
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Upload failed: ${error.message}` }]
                };
            }
        }
    );

    // 3. Upload Progress (Status)
    server.registerTool(
        "wecandeo_upload_progress",
        {
            description: "Check the progress of a video upload.",
            inputSchema: {
                uploadUrl: z.string().describe("The upload URL obtained from create_ticket"),
                token: z.string().describe("The upload token"),
            },
        },
        async ({ uploadUrl, token }) => {
            try {
                const response = await fetch(`${uploadUrl}/uploadStatus.json?token=${token}`);
                if (!response.ok) throw new Error(`Status check failed: ${response.statusText}`);
                const result = await response.json();
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to check upload progress: ${error.message}` }]
                };
            }
        }
    );

    // 4. Video Encoding Status
    server.registerTool(
        "wecandeo_upload_encoding_status",
        {
            description: "Check the encoding status of an uploaded video.",
            inputSchema: {
                access_key: z.string().describe("The video access key (original key)"),
                pkg: z.number().describe("The package ID"),
            },
        },
        async ({ access_key, pkg }) => {
            try {
                const result = await client.get("/web/encoding/status.json", {
                    key: accessKey,
                    access_key,
                    pkg: pkg.toString(),
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to check encoding status: ${error.message}` }]
                };
            }
        }
    );

    // 5. Upload Thumbnail
    server.registerTool(
        "wecandeo_upload_thumbnail",
        {
            description: "Upload a thumbnail image for a video.",
            inputSchema: {
                thumbnailUploadUrl: z.string().describe("Obtained from create_ticket"),
                token: z.string().describe("Upload token"),
                access_key: z.string().describe("Video access key"),
                imageUrl: z.string().describe("URL of the thumbnail image to upload"),
            },
        },
        async ({ thumbnailUploadUrl, token, access_key, imageUrl }) => {
            try {
                const imgResponse = await fetch(imageUrl);
                if (!imgResponse.ok) throw new Error(`Failed to fetch thumbnail image: ${imgResponse.statusText}`);
                const blob = await imgResponse.blob();

                const formData = new FormData();
                formData.append("token", token);
                formData.append("access_key", access_key);
                formData.append("imagefile", blob, "thumbnail.jpg");

                const response = await fetch(`${thumbnailUploadUrl}?token=${token}`, {
                    method: "POST",
                    body: formData
                });

                if (!response.ok) throw new Error(`Thumbnail upload failed: ${response.statusText}`);
                const result = await response.json();
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Thumbnail upload failed: ${error.message}` }]
                };
            }
        }
    );

    // 6. Upload Caption
    server.registerTool(
        "wecandeo_upload_caption",
        {
            description: "Upload a caption (VTT) file for a video.",
            inputSchema: {
                captionUploadUrl: z.string().describe("Obtained from create_ticket"),
                token: z.string().describe("Upload token"),
                access_key: z.string().describe("Video access key"),
                lang_id: z.number().describe("Language ID"),
                captionUrl: z.string().describe("URL of the caption file (.vtt)"),
            },
        },
        async ({ captionUploadUrl, token, access_key, lang_id, captionUrl }) => {
            try {
                const capResponse = await fetch(captionUrl);
                if (!capResponse.ok) throw new Error(`Failed to fetch caption file: ${capResponse.statusText}`);
                const blob = await capResponse.blob();

                const formData = new FormData();
                formData.append("token", token);
                formData.append("access_key", access_key);
                formData.append("lang_id", lang_id.toString());
                formData.append("captionfile", blob, "caption.vtt");

                const response = await fetch(`${captionUploadUrl}?token=${token}&access_key=${access_key}&lang_id=${lang_id}`, {
                    method: "POST",
                    body: formData
                });

                if (!response.ok) throw new Error(`Caption upload failed: ${response.statusText}`);
                const result = await response.json();
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Caption upload failed: ${error.message}` }]
                };
            }
        }
    );

    // 7. Caption Language List
    server.registerTool(
        "wecandeo_upload_caption_language",
        {
            description: "Retrieve list of supported caption languages and their IDs.",
        },
        async () => {
            try {
                const result = await client.get("/info/v1/video/caption/language.json", {
                    key: accessKey,
                });
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to list caption languages: ${error.message}` }]
                };
            }
        }
    );
}
