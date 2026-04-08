import { WecandeoClient } from "../api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Media Archive API Group Tools (31-32)
 */
export function registerArchiveTools(server: McpServer, client: WecandeoClient) {
    const apiKey = client.getApiKey();

    // 31. Retrieve Folder List
    server.tool(
        "wecandeo_archive_list_folders",
        "Retrieve list of folders in the media archive.",
        {},
        async () => {
            const result = await client.get("/info/v1/folders.json", {
                key: apiKey,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 32. Create Folder
    server.tool(
        "wecandeo_archive_create_folder",
        "Create a new folder in the media archive.",
        { folder_name: z.string().describe("Name of the folder to create") },
        async ({ folder_name }) => {
            const result = await client.get("/info/v1/folder/create.json", {
                key: apiKey,
                folder_name,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );
}
