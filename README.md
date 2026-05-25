# BookLog

개인 독서 기록 서비스 모노레포입니다. 현재는 Next.js 프론트엔드와 Spring Boot 백엔드를 실제 API로 연결해 개발하는 단계입니다.

## 구조

```text
bookrecord/
├── docs/              요구사항, ERD, OpenAPI
├── frontend/          Next.js App Router
├── backend/           Spring Boot 3.4.5
└── docker-compose.yml MySQL 개발 DB
```

## 빠른 시작

### 1. MySQL

```bash
docker compose up -d
```

기본 접속 정보는 다음과 같습니다.

```text
database: booklog
username: booklog
password: booklog
port: 3306
```

### 2. Backend

```bash
cd backend
./gradlew bootRun --args="--spring.profiles.active=dev"
```

Windows PowerShell에서는 다음처럼 실행할 수 있습니다.

```powershell
cd backend
.\gradlew.bat bootRun --args="--spring.profiles.active=dev"
```

- Health: http://localhost:8080/actuator/health
- API prefix: http://localhost:8080/api/v1
- `dev` 프로필은 Docker MySQL을 사용합니다.
- `local` 프로필은 H2 인메모리 DB를 사용합니다.

카카오 도서 검색을 사용하려면 백엔드 실행 전에 `KAKAO_REST_API_KEY`를 설정합니다. 키가 없으면 내부 도서 DB 검색으로 자연스럽게 fallback됩니다.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

`frontend/.env.local` 예시:

```text
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_USE_MOCK=false
```

프론트엔드는 http://localhost:3000 에서 확인합니다.

## 검증

```bash
cd backend
./gradlew test

cd ../frontend
npm run lint
npm run build
```

브라우저에서 `/login`, `/`, `/library`, `/search`, `/books/1`, `/collections`, `/stats`, `/settings`를 확인합니다.

## 다음 작업

1. Kakao OAuth 콜백과 JWT 발급 연결
2. JWT 인증 필터와 Refresh Token 처리
3. 책 추가/수정/메모 흐름의 에러 상태 정리
4. 실제 사용자 기준 컬렉션 항목 추가/삭제
5. 배포 환경 구성

## 문서

- [요구사항](docs/REQUIREMENTS.md)
- [ERD](docs/ERD.md)
- [OpenAPI](docs/openapi.yaml)
