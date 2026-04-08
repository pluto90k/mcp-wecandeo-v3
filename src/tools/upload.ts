import { WecandeoClient } from "../api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Upload API Group Tools (1-7)
 */
export function registerUploadTools(server: McpServer, client: WecandeoClient) {
    const apiKey = client.getApiKey();

    // 1. Create Upload Ticket (Token)
    server.tool(
        "wecandeo_upload_create_ticket",
        "Create an upload ticket (token) for video uploading. Returns uploadUrl and token.",
        {},
        async () => {
            const result = await client.get("/web/v3/uploadToken.json", {
                key: apiKey,
            });
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
    );

    // 2. Upload Video File
    server.tool(
        "wecandeo_upload_video",
        "Upload a video file to Wecandeo using a sourceUrl.",
        {
            uploadUrl: z.string().describe("The upload URL obtained from create_ticket"),
            token: z.string().describe("The upload token obtained from create_ticket"),
            sourceUrl: z.string().describe("The external URL of the video file to be uploaded"),
            folder: z.string().describe("Target folder ID in media archive"),
            title: z.string().optional().describe("Video title"),
        },
        async ({ uploadUrl, token, sourceUrl, folder, title }) => {
            const isLocalFile = !sourceUrl.startsWith("http://") && !sourceUrl.startsWith("https://");
            let blob: Blob;
            let fileName: string;

            if (isLocalFile) {
                // Local file path
                try {
                    const buffer = await readFile(sourceUrl);
                    blob = new Blob([buffer]);
                    fileName = path.basename(sourceUrl);
                } catch (err: any) {
                    return {
                        content: [{ type: "text", text: `Error: Cannot read local file: ${err.message}` }],
                    };
                }
            } else {
                // Remote URL - verify accessibility first
                const headResponse = await fetch(sourceUrl, { method: "HEAD" });
                if (!headResponse.ok) {
                    return {
                        content: [{ type: "text", text: `Error: sourceUrl is not accessible (${headResponse.status} ${headResponse.statusText}). Please check the URL.` }],
                    };
                }

                const fileResponse = await fetch(sourceUrl);
                if (!fileResponse.ok) throw new Error(`Source fetch failed: ${fileResponse.statusText}`);
                blob = await fileResponse.blob();
                fileName = "video.mp4";
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

            const result = await uploadResponse.text();
            return {
                content: [{ type: "text", text: result }],
            };
        }
    );

    // 3. Upload Progress (Status)
    server.tool(
        "wecandeo_upload_progress",
        "Check the progress of a video upload.",
        {
            uploadUrl: z.string().describe("The upload URL obtained from create_ticket"),
            token: z.string().describe("The upload token"),
        },
        async ({ uploadUrl, token }) => {
            const response = await fetch(`${uploadUrl}/uploadStatus.json?token=${token}`);
            const result = await response.json();
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
    );

    // 4. Video Encoding Status
    server.tool(
        "wecandeo_upload_encoding_status",
        "Check the encoding status of an uploaded video.",
        {
            access_key: z.string().describe("The video access key (original key)"),
            pkg: z.number().describe("The package ID"),
        },
        async ({ access_key, pkg }) => {
            const result = await client.get("/web/encoding/status.json", {
                key: apiKey,
                access_key,
                pkg: pkg.toString(),
            });
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
    );

    // 5. Upload Thumbnail
    server.tool(
        "wecandeo_upload_thumbnail",
        "Upload a thumbnail image for a video.",
        {
            thumbnailUploadUrl: z.string().describe("Obtained from create_ticket"),
            token: z.string().describe("Upload token"),
            access_key: z.string().describe("Video access key"),
            imageUrl: z.string().describe("URL of the thumbnail image to upload"),
        },
        async ({ thumbnailUploadUrl, token, access_key, imageUrl }) => {
            const imgResponse = await fetch(imageUrl);
            const blob = await imgResponse.blob();

            const formData = new FormData();
            formData.append("token", token);
            formData.append("access_key", access_key);
            formData.append("imagefile", blob, "thumbnail.jpg");

            const response = await fetch(`${thumbnailUploadUrl}?token=${token}`, {
                method: "POST",
                body: formData
            });

            const result = await response.text();
            return {
                content: [{ type: "text", text: result }],
            };
        }
    );

    // 6. Upload Caption
    server.tool(
        "wecandeo_upload_caption",
        "Upload a caption (VTT) file for a video.",
        {
            captionUploadUrl: z.string().describe("Obtained from create_ticket"),
            token: z.string().describe("Upload token"),
            access_key: z.string().describe("Video access key"),
            lang_id: z.number().describe("Language ID"),
            captionUrl: z.string().describe("URL of the caption file (.vtt)"),
        },
        async ({ captionUploadUrl, token, access_key, lang_id, captionUrl }) => {
            const capResponse = await fetch(captionUrl);
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

            const result = await response.text();
            return {
                content: [{ type: "text", text: result }],
            };
        }
    );

    // 7. Caption Language List
    server.tool(
        "wecandeo_upload_caption_language",
        "Retrieve list of supported caption languages and their IDs.",
        {},
        async () => {
            const result = await client.get("/info/v1/video/caption/language.json", {
                key: apiKey,
            });
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
    );

    // 8. Cancel Single Encoding
    server.tool(
        "wecandeo_encoding_cancel",
        "Cancel a specific video encoding request.",
        {
            videoFileKey: z.string().describe("The video file key to cancel"),
        },
        async ({ videoFileKey }) => {
            const result = await client.cancelEncoding(videoFileKey);
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
    );

    // 9. Cancel All Encodings
    server.tool(
        "wecandeo_encoding_cancel_all",
        "Cancel all video encoding requests within an optional date range.",
        {
            startDate: z.string().optional().describe("Start date (yyyy-MM-dd)"),
            endDate: z.string().optional().describe("End date (yyyy-MM-dd)"),
        },
        async ({ startDate, endDate }) => {
            const result = await client.cancelAllEncodings({
                start_date: startDate,
                end_date: endDate,
            });
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
    );

    // 10. Retry Single Encoding
    server.tool(
        "wecandeo_encoding_retry",
        "Retry a specific video encoding request.",
        {
            videoFileKey: z.string().describe("The video file key to retry"),
        },
        async ({ videoFileKey }) => {
            const result = await client.retryEncoding(videoFileKey);
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
    );

    // 11. Retry All Encodings
    server.tool(
        "wecandeo_encoding_retry_all",
        "Retry all failed video encoding requests within an optional date range.",
        {
            startDate: z.string().optional().describe("Start date (yyyy-MM-dd)"),
            endDate: z.string().optional().describe("End date (yyyy-MM-dd)"),
        },
        async ({ startDate, endDate }) => {
            const result = await client.retryAllEncodings({
                start_date: startDate,
                end_date: endDate,
            });
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
    );

    // 12. List All Encoding Requests
    server.tool(
        "wecandeo_encoding_list",
        "List all video encoding requests with optional filtering and pagination.",
        {
            status: z.string().optional().describe("Encoding status to filter (e.g., BEING,WAIT,CANCEL)"),
            startDate: z.string().optional().describe("Start date (yyyy-MM-dd)"),
            endDate: z.string().optional().describe("End date (yyyy-MM-dd)"),
            page: z.number().optional().describe("Page number (default: 1)"),
            pageSize: z.number().optional().describe("Items per page (default: 10, max: 100)"),
        },
        async ({ status, startDate, endDate, page, pageSize }) => {
            const result = await client.listEncodingRequests({
                status,
                start_date: startDate,
                end_date: endDate,
                page,
                pagesize: pageSize,
            });
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
    );
}
