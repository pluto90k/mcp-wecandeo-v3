# Wecandeo VideoPack MCP Server (v3)

Wecandeo VideoPack API를 위한 MCP 서버입니다. **Cloudflare Workers** 배포와 **Node.js 인스턴스(pm2)** 실행을 모두 지원합니다.

## Features

- **Upload APIs**: Create tickets, stream video files, track progress/encoding, upload thumbnails and captions.
- **Video Data Retrieve**: List videos by package/folder, get details, publish info, encoded files, and one-time keys.
- **Video Data Update**: Manage package inclusion, publish/pause control, metadata (title, tags, etc.), and thumbnail settings.
- **Package APIs**: Explore packages, global publish actions, domain restrictions, and playlists.
- **Media Archive**: Manage folders.

## Prerequisites & API Key

To use this MCP server, you need an active Wecandeo account and an API Access Key.

1. **Sign up / Login**: Go to the [Wecandeo Official Website](https://www.wecandeo.com) and log in.
2. **Issue API Key**: Navigate to the Developer or API Settings menu in your VideoPack console to generate an `ACCESS_KEY`.
3. **Support**: If you need help with API limits or account details, please visit the [Wecandeo Support Center](https://support.wecandeo.com).

---

## 실행 방식

이 서버는 두 가지 방식으로 운영할 수 있습니다.

| 방식 | 특징 | 적합한 환경 |
| :--- | :--- | :--- |
| **Node.js 인스턴스 (pm2)** | 서버에 상시 실행, 빠른 응답 | 온프레미스 서버, VPS |
| **Cloudflare Workers** | 서버리스, 글로벌 엣지 | 무서버 운영, 퍼블릭 배포 |

---

## Node.js 인스턴스 (pm2)

### 사전 요구 사항

```bash
npm install -g pm2
```

### 1. 빌드

```bash
npm install
npm run build
```

### 2. 환경 변수 설정

`WECANDEO_ACCESS_KEY`를 환경 변수로 설정합니다.

```bash
export WECANDEO_ACCESS_KEY=your-api-key
```

또는 `ecosystem.config.cjs`에 직접 입력:

```js
// ecosystem.config.cjs
env: {
  NODE_ENV: "production",
  PORT: 3000,
  WECANDEO_ACCESS_KEY: "your-api-key",
},
```

### 3. pm2로 시작

```bash
npm run pm2:start
# 또는
pm2 start ecosystem.config.cjs
```

### pm2 관리 명령어

```bash
npm run pm2:status    # 상태 확인
npm run pm2:logs      # 로그 보기
npm run pm2:restart   # 재시작
npm run pm2:stop      # 중지
```

### 4. MCP 클라이언트 설정

서버가 실행되면 아래 엔드포인트를 MCP 클라이언트에 연결합니다.

- `http://localhost:3000/mcp` — Streamable HTTP (표준)
- `http://localhost:3000/sse` — SSE 호환
- `http://localhost:3000/health` — 헬스체크

**Claude Desktop / Cursor / Windsurf 설정** (`claude_desktop_config.json` 또는 `mcp_config.json`):

```json
{
  "mcpServers": {
    "wecandeo": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote@latest",
        "http://localhost:3000/mcp"
      ]
    }
  }
}
```

> API 키를 인스턴스에 설정하지 않은 경우, URL 쿼리 파라미터로 전달할 수 있습니다:
> `http://localhost:3000/mcp?key=<YOUR_WECANDEO_ACCESS_KEY>`

### 포트 변경

`PORT` 환경 변수로 포트를 지정합니다 (기본값: `3000`).

```bash
PORT=8080 WECANDEO_ACCESS_KEY=your-key npm run start:instance
```

### pm2 시작 시 자동 실행 설정

```bash
pm2 startup        # 시스템 부팅 시 pm2 자동 실행 설정
pm2 save           # 현재 프로세스 목록 저장
```

---

## Cloudflare Workers 배포

### 사전 요구 사항

- Cloudflare 계정 및 `wrangler` CLI

### 1. 환경 변수 설정

```bash
wrangler secret put WECANDEO_ACCESS_KEY
```

### 2. 배포

```bash
npm run deploy
# 또는 GitHub Actions (CF_API_TOKEN, CF_ACCOUNT_ID 시크릿 필요)
```

### 3. MCP 클라이언트 설정

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

- `<your-worker-url>`을 실제 Cloudflare Worker 도메인으로 교체합니다.
- `<YOUR_WECANDEO_ACCESS_KEY>`를 Wecandeo API 키로 교체합니다.

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
