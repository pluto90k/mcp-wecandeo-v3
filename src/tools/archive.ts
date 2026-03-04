import { WecandeoClient } from "../api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Media Archive API Group Tools (31-33*)
 * Note: Delete Video (33) appeared to be manual-only in docs, skipping if no endpoint found.
 */
export function registerArchiveTools(server: McpServer) {
    // 31. Retrieve Folder List
    server.tool(
        "wecandeo_archive_list_folders",
        "Retrieve list of folders in the media archive.",
        {},
        async (_, context: any) => {
            const env = context.auth as any;
            const client = new WecandeoClient(env.WECANDEO_ACCESS_KEY);
            const result = await client.get("https://api.wecandeo.com/info/v1/folders.json", {
                key: env.WECANDEO_ACCESS_KEY,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // 32. Create Folder
    server.tool(
        "wecandeo_archive_create_folder",
        "Create a new folder in the media archive.",
        { folder_name: z.string().describe("Name of the folder to create") },
        async ({ folder_name }, context: any) => {
            const env = context.auth as any;
            const client = new WecandeoClient(env.WECANDEO_ACCESS_KEY);
            const result = await client.get("https://api.wecandeo.com/info/v1/folder/create.json", {
                key: env.WECANDEO_ACCESS_KEY,
                folder_name,
            });
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );
}
