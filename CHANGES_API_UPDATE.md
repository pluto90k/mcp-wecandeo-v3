# Wecandeo MCP API Update - Changes Log

## 개요
동영상 인코딩 관리 API 5종 추가 및 환경 변수 명칭 업데이트(`WECANDEO_API_KEY`)를 수행하였습니다.

## 주요 변경 사항

### 1. 환경 변수 이름 변경 및 호환성 지원
- `WECANDEO_ACCESS_KEY` 대신 `WECANDEO_API_KEY`를 기본으로 사용하도록 변경하였습니다.
- 기존 사용자의 편의를 위해 `WECANDEO_ACCESS_KEY`가 설정되어 있을 경우에도 정상적으로 동작합니다.
- 우선순위: `WECANDEO_API_KEY` > `WECANDEO_ACCESS_KEY`

### 2. 신규 인코딩 관리 도구 추가 (5종)
| 도구 명칭 | 설명 | 파라미터 |
|---|---|---|
| `wecandeo_encoding_cancel` | 특정 비디오의 인코딩을 취소합니다. | `videoFileKey` |
| `wecandeo_encoding_cancel_all` | 계정 내 모든 대기 중인 인코딩을 취소합니다. | `startDate`, `endDate` (선택) |
| `wecandeo_encoding_retry` | 실패한 특정 인코딩을 재시도합니다. | `videoFileKey` |
| `wecandeo_encoding_retry_all` | 실패한 모든 인코딩을 재시도합니다. | `startDate`, `endDate` (선택) |
| `wecandeo_encoding_list` | 전체 인코딩 요청 목록을 조회합니다. | `status`, `startDate`, `endDate`, `page`, `pageSize` (선택) |

### 3. 소스 코드 수정 내역
- `src/index.ts`: 환경 변수 로드 로직 수정 및 클라이언트 초기화 코드 업데이트.
- `src/api/client.ts`:
    - `accessKey`를 `apiKey`로 명칭 통일.
    - `getApiKey()` 메서드 추가.
    - 인코딩 관련 신규 메서드 5종 구현.
    - `get()` 메서드의 파라미터 처리 방식 개선 (타입 유연성 및 null/undefined 체크).
- `src/tools/upload.ts`:
    - 신규 인코딩 도구 5종 등록.
    - 기존 도구들의 API 키 참조 변수명 업데이트(`apiKey`).

### 4. 문서 업데이트
- `README.md`: 신규 도구 설명 추가, 도구 총 개수 업데이트(32 -> 37), 설치 및 설정 예시에서 `WECANDEO_API_KEY` 사용.

## 참고 사항
타 브랜치 적용 시 위 수정 사항들을 참고하여 `src` 폴더 내의 클라이언트 및 도구 등록 로직을 동일하게 반영하시기 바랍니다.
