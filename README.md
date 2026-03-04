# Wecandeo VideoPack MCP Server (v3)

Cloudflare Workers based MCP server for Wecandeo VideoPack API.

## Features

- **Upload APIs**: Create tickets, stream video files, track progress/encoding, upload thumbnails and captions.
- **Video Data Retrieve**: List videos by package/folder, get details, publish info, encoded files, and one-time keys.
- **Video Data Update**: Manage package inclusion, publish/pause control, metadata (title, tags, etc.), and thumbnail settings.
- **Package APIs**: Explore packages, global publish actions, domain restrictions, and playlists.
- **Media Archive**: Manage folders.

## Setup

1. **Environment Variables**:
   - `WECANDEO_ACCESS_KEY`: Your Wecandeo API Key.

2. **Deployment**:
   - Use GitHub Actions (configured in `.github/workflows/deploy.yml`).
   - Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets in GitHub.

## Usage (MCP)

This server supports SSE transport.
- SSE Endpoint: `https://<your-worker>.workers.dev/sse`
- Message Endpoint: `https://<your-worker>.workers.dev/message`

### Tools Example
- `wecandeo_upload_create_ticket`: Start the upload process.
- `wecandeo_video_list_package`: List videos in a package.
- `wecandeo_video_modify_meta`: Update video title or tags.
