# BookLog — 요구사항 정리

인터뷰 기반으로 확정된 요구사항 및 설계 계획입니다.

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 서비스 명 | BookLog |
| 시작 방향 | 개인·지인 전용 → 점진적으로 프로덕션 확대 |
| 인증 | 소셜 로그인만 (Google OAuth2, Kakao OAuth2) |
| 도서 검색 API | 카카오 도서 검색 API (한국어 도서 특화) |
| 프론트엔드 | Next.js (React) — REST API 분리 구조 |
| 백엔드 | Spring Boot 3.x (Java) |
| 데이터베이스 | MySQL (AWS RDS Free Tier) |
| 파일 스토리지 | AWS S3 (프로필 이미지 등) |
| 배포 | AWS Free Tier (EC2 t2.micro + RDS + S3) |

## 디자인 방향

- Notion 문서 편집 UX + 독서 특화 시각 요소
- 인라인 편집 (클릭하면 바로 수정)
- 책 표지 그리드 뷰, 히트맵 캘린더 (GitHub 잔디 스타일), 연간 독서 코틀 링

## Phase 1 — MVP

### 1. 회원 인증

- Google OAuth2, Kakao OAuth2
- JWT Access Token + Refresh Token
- 로그아웃 (Refresh 무효화)

### 2. 책 등록 / 검색

- 카카오 도서 검색 API (제목, 저자, ISBN) — **서버 프록시만**
- 검색 결과에서 내 서재에 추가
- 직접 입력으로 책 추가

### 3. 독서 기록 (핵심)

| 기능 | 규칙 |
|------|------|
| 독서 상태 | `WANT_TO_READ`, `READING`, `FINISHED`, `DNF` |
| 진행률 | `currentPage / totalPages` (total은 Book 또는 UserBook override) |
| 별점 | 1~5, **0.5 단위** |
| 리뷰 / 한줄평 | Notion 인라인 편집 |
| 페이지별 메모 | page + content |
| 시작일 / 완독일 | status 전환 시 제안 + 수동 수정 |
| 태그 / 카테고리 | 문자열 태그 배열 (MVP) |

### 4. 서재 뷰

- 상태별 필터, 리스트/그리드 전환
- 정렬: 최신순 / 평점순 / 제목순
- 커스텀 컬렉션

### 5. 독서 통계

- 연간 완독 권수 / 목표 달성률
- 월별 독서량, 장르별 비율, 히트맵, 평균 별점

## Phase 2 — 소셜

- 팔로우 / 팔로워
- 피드 (팔로우 대상 활동)
- 공개 범위: `PUBLIC`, `FOLLOWERS`, `PRIVATE` (UserBook·메모 단위)

MVP 스키마에 `visibility` 컬럼 예약 (기본 `PRIVATE`).

## 비기능 요구사항

- OAuth 클라이언트 시크릿·카카오 REST API 키는 백엔드만 보유
- Access JWT는 Authorization Bearer, Refresh는 별도 엔드포인트
- CORS: 프론트 origin 허용 (로컬 `http://localhost:3000`)

## API 버전

모든 REST 경로 prefix: `/api/v1`
