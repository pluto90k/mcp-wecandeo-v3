# Wecandeo VideoPack MCP Server

Wecandeo VideoPack API를 위한 MCP(Model Context Protocol) 서버입니다.
Claude Desktop, Claude Code, Cursor 등 MCP 클라이언트에서 Wecandeo 비디오 관리 도구 32개를 Stdio 모드로 사용할 수 있습니다.

- **홈페이지**: [https://www.wecandeo.com](https://www.wecandeo.com)
- **API 가이드**: [https://support.wecandeo.com](https://support.wecandeo.com)

## 설치 및 실행

### 환경 변수

| 변수 | 설명 |
|---|---|
| `WECANDEO_ACCESS_KEY` | Wecandeo API 액세스 키 (필수) |

### npx로 실행 (권장)

별도 설치 없이 바로 실행할 수 있습니다:

```bash
WECANDEO_ACCESS_KEY=your_key npx @pluto90/wecandeo-v3-mcp
```

### Claude Desktop 설정

`claude_desktop_config.json`에 아래와 같이 추가합니다:

```json
{
  "mcpServers": {
    "wecandeo": {
      "command": "npx",
      "args": ["-y", "@pluto90/wecandeo-v3-mcp"],
      "env": {
        "WECANDEO_ACCESS_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Claude Code 설정

`~/.claude.json` (글로벌) 또는 프로젝트 `.mcp.json`에 아래와 같이 추가합니다:

```json
{
  "mcpServers": {
    "wecandeo": {
      "command": "npx",
      "args": ["@pluto90/wecandeo-v3-mcp"],
      "env": {
        "WECANDEO_ACCESS_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Cursor 설정

`.cursor/mcp.json`에 아래와 같이 추가합니다:

```json
{
  "mcpServers": {
    "wecandeo": {
      "command": "npx",
      "args": ["-y", "@pluto90/wecandeo-v3-mcp"],
      "env": {
        "WECANDEO_ACCESS_KEY": "your_api_key_here"
      }
    }
  }
}
```

### 소스에서 직접 실행

```bash
# 빌드
npm install && npm run build

# 실행
WECANDEO_ACCESS_KEY=your_key node dist/index.js
```

## 제공 도구 (32개)

| 그룹 | 도구 | 설명 |
|---|---|---|
| **Upload** | `wecandeo_upload_create_ticket` | 업로드 토큰 생성 |
| | `wecandeo_upload_video` | 비디오 업로드 (로컬 파일 및 URL 지원) |
| | `wecandeo_upload_progress` | 업로드 진행률 |
| | `wecandeo_upload_encoding_status` | 인코딩 상태 |
| | `wecandeo_upload_thumbnail` | 썸네일 업로드 |
| | `wecandeo_upload_caption` | 자막 업로드 |
| | `wecandeo_upload_caption_language` | 자막 언어 목록 |
| **Video Retrieve** | `wecandeo_video_list_package` | 패키지별 비디오 목록 |
| | `wecandeo_video_list_folder` | 폴더별 비디오 목록 |
| | `wecandeo_video_details` | 비디오 상세 정보 |
| | `wecandeo_video_pub_code` | 배포 코드 조회 |
| | `wecandeo_video_encoded_file` | 인코딩 파일 목록 |
| | `wecandeo_video_onetime_key` | 일회성 키 생성 |
| | `wecandeo_video_thumbnail` | 썸네일 정보 |
| | `wecandeo_video_caption` | 자막 정보 |
| **Video Update** | `wecandeo_video_add_to_package` | 패키지 추가 |
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
