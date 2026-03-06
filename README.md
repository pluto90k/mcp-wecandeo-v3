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
   - Requires `CF_API_TOKEN` and `CF_ACCOUNT_ID` secrets in GitHub.

## Usage (MCP Client Setup)

Since this MCP server is deployed on Cloudflare Workers (which is stateless), you cannot connect to it using a standard local executable. Instead, you need to use an SSE bridge to connect your local MCP client (like Cursor, Claude Desktop, or Windsurf) to the remote server.

The recommended and most standard way to do this is using the generic `mcp-remote` npm package.

### Configuration (`mcp_config.json` or `claude_desktop_config.json`)

Add the following to your MCP client configuration file:

```json
{
  "mcpServers": {
    "wecandeo": {
        "command": "npx",
        "args": [
            "-y",
            "mcp-remote@latest",
            "https://<your-worker-url>.workers.dev/sse?key=<YOUR_WECANDEO_ACCESS_KEY>"
        ]
    }
  }
}
```

- Replace `<your-worker-url>` with your actual Cloudflare Worker domain.
- Replace `<YOUR_WECANDEO_ACCESS_KEY>` with your user-specific Wecandeo API Key.
- *Note:* Depending on your environment, you may also pass the key via the `X-Wecandeo-Access-Key` HTTP header instead of the URL query parameter, but standard STDIO bridges usually find it easiest via the URL query.

---

## Available Tools

| Category | Tool Name | Description |
| :--- | :--- | :--- |
| **Upload** | `wecandeo_upload_create_ticket` | 업로드 티켓 생성 (token, url 확보) |
| | `wecandeo_upload_progress` | 업로드 진행 상태 확인 |
| | `wecandeo_upload_encoding_status` | 인코딩 상태 확인 |
| | `wecandeo_upload_thumbnail` | 썸네일 업로드 |
| | `wecandeo_upload_caption_language` | 지원 자막 언어 목록 조회 |
| | `wecandeo_upload_caption` | 자막 파일 업로드 |
| **Video** | `wecandeo_video_list_package` | 특정 패키지의 동영상 목록 |
| | `wecandeo_video_list_folder` | 특정 폴더의 동영상 목록 |
| | `wecandeo_video_details` | 동영상 상세 정보 |
| | `wecandeo_video_pub_code` | 배포/플레이어 코드 조회 |
| | `wecandeo_video_thumbnail` | 썸네일 정보 조회 |
| | `wecandeo_video_caption` | 자막 파일 정보 조회 |
| | `wecandeo_video_encoded_file` | 인코딩 파일 목록 조회 |
| | `wecandeo_video_onetime_key` | 일회성 접근 키(Onetime key) 생성 |
| | `wecandeo_video_add_to_package` | 패키지 추가 |
| | `wecandeo_video_exclude_from_package` | 패키지 제외 |
| | `wecandeo_video_start_publish` | 배포 시작 |
| | `wecandeo_video_pause_publish` | 배포 중지 |
| | `wecandeo_video_modify_folder` | 폴더 이동 |
| | `wecandeo_video_modify_meta` | 메타데이터 수정 |
| | `wecandeo_video_modify_extra` | 바이럴 링크 설정 |
| | `wecandeo_video_set_default_thumbnail` | 대표 썸네일 설정 |
| **Package** | `wecandeo_package_list` | 패키지 목록 |
| | `wecandeo_package_publish_all` | 전체 배포 |
| | `wecandeo_package_unpublish_all` | 전체 배포 중지 |
| | `wecandeo_package_block_domain` | 도메인 차단 |
| | `wecandeo_package_unblock_domain` | 도메인 차단 해제 |
| | `wecandeo_package_playlists` | 플레이리스트 목록 |
| | `wecandeo_package_playlist_details` | 플레이리스트 상세 |
| **Archive** | `wecandeo_archive_list_folders` | 폴더 목록 |
| | `wecandeo_archive_create_folder` | 폴더 생성 |
| | *(공통)* | `ping` | 서버 응답 확인 |
