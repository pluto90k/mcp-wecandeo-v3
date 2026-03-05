import { WecandeoClient } from "../api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Upload API Group Tools (1-7)
 */
export function registerUploadTools(server: McpServer, client: WecandeoClient) {
    const accessKey = client.getAccessKey();

    // 1. Create Upload Ticket (Token)
    server.tool(
        "wecandeo_upload_create_ticket",
        "Create an upload ticket (token) for video uploading. Returns uploadUrl and token.",
        {},
        async () => {
            const result = await client.get("/web/v3/uploadToken.json", {
                key: accessKey,
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
            const fileResponse = await fetch(sourceUrl);
            if (!fileResponse.ok) throw new Error(`Source fetch failed: ${fileResponse.statusText}`);

            const formData = new FormData();
            formData.append("token", token);
            formData.append("folder", folder);
            if (title) formData.append("title", title);

            const blob = await fileResponse.blob();
            formData.append("videofile", blob, "video.mp4");

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
                key: accessKey,
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
                key: accessKey,
            });
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
    );
}
