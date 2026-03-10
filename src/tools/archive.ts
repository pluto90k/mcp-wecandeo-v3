import { WecandeoClient } from "../api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Media Archive API Group Tools (31-33*)
 * Note: Delete Video (33) appeared to be manual-only in docs, skipping if no endpoint found.
 */
export function registerArchiveTools(server: McpServer, client: WecandeoClient) {
    const accessKey = client.getAccessKey();

    // -- Tools --

    // 31. Retrieve Folder List
    server.registerTool(
        "wecandeo_archive_list_folders",
        {
            description: "List all folders (directories/폴더 목록) in the media archive. Use this when the user asks '폴더 목록', '폴더 리스트', 'folder list', or 'show folders'. Returns folder names and IDs only — does NOT return videos.",
        },
        async () => {
            try {
                const result = await client.get("/info/v1/folders.json", { key: accessKey });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to list folders: ${error.message}` }]
                };
            }
        }
    );

    // 32. Create Folder
    server.registerTool(
        "wecandeo_archive_create_folder",
        {
            description: "Create a new folder in the media archive.",
            inputSchema: {
                folder_name: z.string().describe("Name of the folder to create"),
            },
        },
        async ({ folder_name }) => {
            try {
                const result = await client.get("/info/v1/folder/create.json", {
                    key: accessKey,
                    folder_name,
                });
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Failed to create folder: ${error.message}` }]
                };
            }
        }
    );

    // -- Resources --

    // Resource: Folders
    server.registerResource(
        "archive_folders",
        "wecandeo://archive/folders",
        { description: "List of all folders in the media archive" },
        async (uri) => {
            const result = await client.get("/info/v1/folders.json", { key: accessKey });
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
