# Open Samguk 구현 필수 요구사항

이 문서는 레거시 시스템을 새로운 아키텍처(Layered Architecture, DDD)로 포팅할 때 반드시 준수해야 하는 기술적/비즈니스적 요구사항을 정리합니다.

## 1. 아키텍처 원칙
*   **Layered Architecture 적용:**
    *   `interface`: 외부 요청 수신 (Controller, Gateway).
    *   `application`: 도메인 객체 오케스트레이션 및 유즈케이스 구현.
    *   `domain`: 핵심 비즈니스 로직 (Entity, Value Object, Domain Service).
    *   `infrastructure`: 기술적 세부 구현 (Persistence, External API, Cache).
*   **DDD (Domain-Driven Design):**
    *   상태만 가진 빈 객체(Anemic Domain Model)가 아닌, 비즈니스 로직을 포함하는 **Rich Domain Model**을 지향한다.
    *   도메인 레이어는 인프라 레이어에 의존하지 않는다 (인터페이스 사용).
*   **TDD (Test-Driven Development):**
    *   도메인 로직 및 핵심 유즈케이스에 대해 유닛 테스트를 먼저 작성하거나 병행한다.
*   **메모리 상태 권위 (In-Memory Authority):**
    *   모든 게임 내 연산의 Source of Truth는 백엔드 메모리 상태이다.
    *   DB는 영속성(Persistence) 보장을 위한 스냅샷과 저널 기록 용도로만 사용한다.

## 2. 기술적 요구사항
*   **결정론적 처리 (Determinism):**
    *   동일한 입력과 시드(Seed)에 대해 항상 동일한 결과가 나와야 한다.
    *   RNG(Random Number Generator)는 명시적인 시드 관리를 통해 제어한다.
*   **복구 메커니즘:**
    *   시스템 재시작 시 `최신 스냅샷 + 이후 저널 재생(Replay)`을 통해 메모리 상태를 완벽히 복원해야 한다.
*   **실시간성:**
    *   상태 변경 결과는 WebSocket(개인/국가) 또는 SSE(전역/턴 틱)를 통해 즉시 브로드캐스트되어야 한다.
*   **동시성 제어:**
    *   턴 처리는 단일 데몬 프로세스에서 순차적으로 실행됨을 보장하여 데이터 레이스 조건을 방지한다.

## 3. 비즈니스 요구사항 (Phase 1-2 핵심)
*   **장수(General):** 가입, 정보 조회, 자원 관리, 턴 예약 기능.
*   **국가(Nation):** 국가 생성, 도시 점령 상태 관리, 경제 수치 관리.
*   **도시(City):** 인구, 경제, 국방 수치 관리 및 소속 국가 연동.
*   **턴 실행:** 정해진 시간에 배치를 트리거하고, 장수/국가 커맨드를 실행 순서에 맞춰 처리.

## 4. 기타 규칙
*   **언어:** 모든 코드 내 주석, 에러 메시지, 로그는 **한글**을 원칙으로 한다.
*   **코딩 스타일:** `tsconfig.base.json`의 엄격한 설정을 준수하며, 명시적 타입을 사용한다.
