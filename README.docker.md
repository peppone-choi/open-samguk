# Sammo-TS Docker Setup

이 프로젝트는 Docker를 사용하여 쉽게 실행할 수 있도록 구성되어 있습니다.

## 🏗 서비스 구성

- **db**: PostgreSQL 16 (데이터베이스)
- **redis**: Redis 7 (세션 및 캐시)
- **api**: backend API 서버 (NestJS)
- **engine**: 게임 로직 프로세서 (턴 데몬)
- **web**: 프론트엔드 (Next.js)
- **db-migrate**: 데이터베이스 스키마 동기화 (Prisma)

## 🚀 시작하기

1. **환경 변수 설정**
   `.env` 파일을 생성하거나 `docker-compose.yml` 리터럴을 수정합니다.

2. **실행**
   ```bash
   docker-compose up -d
   ```

3. **종료**
   ```bash
   docker-compose down
   ```

## 🛠 주요 명령어

- **로그 확인**: `docker-compose logs -f [service_name]`
- **데이터베이스 초기화 (Prisma Push)**: 
  ```bash
  docker-compose run --rm db-migrate
  ```

이 설정은 [legacy Docker setup](https://storage.hided.net/gitea/devsam/docker)의 구조를 참고하여 삼국지 모의전투 TS 버전에 맞게 현대화되었습니다.
