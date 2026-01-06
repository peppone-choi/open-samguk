# Event Catalog

이벤트 시스템 전체 목록과 포팅 우선순위를 정리합니다.

## 이벤트 시스템 개요

### 아키텍처

```
legacy/hwe/sammo/Event/
├── Action/           # 30개 이벤트 액션
├── Condition/        # 6개 이벤트 조건
├── Action.php        # 추상 액션 클래스
├── Condition.php     # 추상 조건 클래스
├── Engine.php        # 이벤트 엔진 (미구현)
└── EventHandler.php  # 조건+액션 핸들러

legacy/hwe/sammo/StaticEvent/   # 2개 정적 이벤트
legacy/hwe/sammo/StaticEventHandler.php
legacy/hwe/sammo/TurnExecutionHelper.php  # 이벤트 실행 진입점
```

### 이벤트 타겟 (트리거 시점)

| Target        | 값               | 설명                   |
| ------------- | ---------------- | ---------------------- |
| PreMonth      | `PRE_MONTH`      | YearMonth 변경 전 처리 |
| Month         | `MONTH`          | 월간 이벤트            |
| OccupyCity    | `OCCUPY_CITY`    | 도시 점령 시           |
| DestroyNation | `DESTROY_NATION` | 국가 멸망 시           |
| United        | `UNITED`         | 천하통일 시            |

### 월간 이벤트 실행 순서

`TurnExecutionHelper::executeAllCommand()` 기준:

```
1. runEventHandler(PreMonth)      # PRE_MONTH 이벤트
2. preUpdateMonthly()             # 월간 사전 업데이트
3. turnDate()                     # 날짜 갱신
4. checkStatistic() (1월만)       # 통계 체크
5. runEventHandler(Month)         # MONTH 이벤트
6. postUpdateMonthly()            # 월간 사후 업데이트
```

---

## Event Actions (30개)

### 경제 시스템 (P0 - 게임 진행 필수)

#### ProcessIncome

- **트리거**: Month (봄: 금, 가을: 쌀)
- **효과**: 세금/세곡 징수 및 봉급 지급
- **관련 엔티티**: Nation, General, City
- **RNG**: 없음
- **레거시**: `legacy/hwe/sammo/Event/Action/ProcessIncome.php`

#### ProcessWarIncome

- **트리거**: Month
- **효과**: 전쟁 수입 처리 (도시별 금 수입, 부상병 20% 인구 회복)
- **관련 엔티티**: Nation, City
- **RNG**: 없음
- **레거시**: `legacy/hwe/sammo/Event/Action/ProcessWarIncome.php`

#### ProcessSemiAnnual

- **트리거**: Month (반기)
- **효과**:
  - 내정 1% 자연 감소
  - 인구 증가/감소 (세율에 따라)
  - 장수/국가 자원 유지비 처리
- **관련 엔티티**: City, General, Nation
- **RNG**: 없음
- **레거시**: `legacy/hwe/sammo/Event/Action/ProcessSemiAnnual.php`

#### RandomizeCityTradeRate

- **트리거**: Month
- **효과**: 도시 시세 랜덤화 (95~105%)
- **관련 엔티티**: City
- **RNG**: 예 (LiteHashDRBG, seed: hiddenSeed + year + month)
- **레거시**: `legacy/hwe/sammo/Event/Action/RandomizeCityTradeRate.php`

---

### 도시/보급 시스템 (P0 - 게임 진행 필수)

#### UpdateCitySupply

- **트리거**: Month
- **효과**:
  - 수도에서 연결된 도시 보급 상태 계산 (BFS)
  - 미보급 도시 내정 10% 감소
  - 미보급 도시 장수 병/훈/사 5% 감소
  - 민심 30 이하 미보급 도시 공백지 전환
- **관련 엔티티**: City, General, Nation
- **RNG**: 없음
- **레거시**: `legacy/hwe/sammo/Event/Action/UpdateCitySupply.php`

#### ChangeCity

- **트리거**: 시나리오 시작 또는 특수 이벤트
- **효과**: 도시 속성 일괄 변경 (인구, 내정, 민심 등)
- **관련 엔티티**: City
- **RNG**: 없음
- **레거시**: `legacy/hwe/sammo/Event/Action/ChangeCity.php`

---

### 국가 시스템 (P0 - 게임 진행 필수)

#### UpdateNationLevel

- **트리거**: Month
- **효과**:
  - 도시 수에 따른 국가 레벨 업데이트
  - 레벨업 시 금/쌀 보상
  - 레벨업 시 유니크 아이템 지급
  - 황제 책봉 시 국기/국호 변경 가능
- **관련 엔티티**: Nation, General
- **RNG**: 예 (유니크 아이템 지급용)
- **레거시**: `legacy/hwe/sammo/Event/Action/UpdateNationLevel.php`

#### ResetOfficerLock

- **트리거**: Month (연초)
- **효과**: 천도/관직 변경 제한 해제
- **관련 엔티티**: Nation, City
- **RNG**: 없음
- **레거시**: `legacy/hwe/sammo/Event/Action/ResetOfficerLock.php`

---

### 장수 시스템 (P0 - 게임 진행 필수)

#### NewYear

- **트리거**: Month (1월)
- **효과**:
  - 새해 알림 메시지
  - 전체 장수 나이 +1
  - 소속 국가 장수 호봉 +1
- **관련 엔티티**: General
- **RNG**: 없음
- **레거시**: `legacy/hwe/sammo/Event/Action/NewYear.php`

#### AssignGeneralSpeciality

- **트리거**: Month
- **효과**:
  - 특기 나이에 도달한 장수에게 내정/전투 특기 부여
  - 시작 3년 이후부터 적용
- **관련 엔티티**: General
- **RNG**: 예 (특기 선택용)
- **레거시**: `legacy/hwe/sammo/Event/Action/AssignGeneralSpeciality.php`

---

### 재난/호황 시스템 (P1 - 주요 게임플레이)

#### RaiseDisaster

- **트리거**: Month (1월, 4월, 7월, 10월)
- **효과**:
  - 시작 3년 이후부터 적용
  - 계절별 재난/호황 발생 (역병, 지진, 홍수, 태풍, 메뚜기 등)
  - 재난: 도시 내정/인구/민심 감소, 장수 부상 가능
  - 호황: 도시 내정/인구/민심 증가
- **관련 엔티티**: City, General
- **RNG**: 예 (LiteHashDRBG, seed: hiddenSeed + 'disaster' + year + month)
- **레거시**: `legacy/hwe/sammo/Event/Action/RaiseDisaster.php`

---

### 이민족 시스템 (P1 - 주요 게임플레이)

#### RaiseInvader

- **트리거**: 특수 조건 (국가 수 감소 등)
- **효과**:
  - 이민족 국가 생성 (level 4 도시에)
  - 기존 국가 수도가 해당 도시면 천도
  - 이민족 장수 자동 생성
  - 전체 국가와 자동 전쟁 상태
- **관련 엔티티**: Nation, General, City, Diplomacy
- **RNG**: 예 (장수 생성용)
- **레거시**: `legacy/hwe/sammo/Event/Action/RaiseInvader.php`

#### AutoDeleteInvader

- **트리거**: Month (이민족 이벤트 중)
- **효과**: 전쟁 중이 아닌 이민족 국가 자동 해산
- **관련 엔티티**: Nation, General
- **RNG**: 없음
- **레거시**: `legacy/hwe/sammo/Event/Action/AutoDeleteInvader.php`

#### InvaderEnding

- **트리거**: Month (이민족 이벤트 중)
- **효과**:
  - 이민족 이벤트 종료 조건 체크
  - 유저 승리/이민족 승리 결정
  - 게임 상태 업데이트
- **관련 엔티티**: Nation, City
- **RNG**: 없음
- **레거시**: `legacy/hwe/sammo/Event/Action/InvaderEnding.php`

---

### NPC 시스템 (P1 - 주요 게임플레이)

#### CreateManyNPC

- **트리거**: Month
- **효과**:
  - 일괄 NPC 장수 생성
  - 장수 풀에서 선택하여 생성
- **관련 엔티티**: General
- **RNG**: 예 (장수 선택/스탯용)
- **레거시**: `legacy/hwe/sammo/Event/Action/CreateManyNPC.php`

#### RegNPC

- **트리거**: 시나리오 시작 또는 특수 이벤트
- **효과**: 특정 NPC 장수 등록 (지정된 스탯/특기)
- **관련 엔티티**: General
- **RNG**: 예 (시드 생성용)
- **레거시**: `legacy/hwe/sammo/Event/Action/RegNPC.php`

#### RegNeutralNPC

- **트리거**: 시나리오 시작 또는 특수 이벤트
- **효과**: 중립 NPC 장수 등록 (npc_type = 6)
- **관련 엔티티**: General
- **RNG**: 예 (시드 생성용)
- **레거시**: `legacy/hwe/sammo/Event/Action/RegNeutralNPC.php`

#### RaiseNPCNation

- **트리거**: Month
- **효과**:
  - 공백지에 NPC 국가 생성
  - 기존 국가와 일정 거리 유지
  - 평균 내정/장수 수 기준으로 생성
- **관련 엔티티**: Nation, General, City
- **RNG**: 예 (국가 생성용)
- **레거시**: `legacy/hwe/sammo/Event/Action/RaiseNPCNation.php`

#### ProvideNPCTroopLeader

- **트리거**: Month
- **효과**:
  - 국가 레벨에 따라 NPC 부대장 자동 생성
  - 부대 자동 생성 및 집합 명령 설정
- **관련 엔티티**: General, Nation, Troop
- **RNG**: 예 (부대장 생성용)
- **레거시**: `legacy/hwe/sammo/Event/Action/ProvideNPCTroopLeader.php`

#### CreateAdminNPC

- **트리거**: 미구현
- **효과**: NYI (Not Yet Implemented)
- **레거시**: `legacy/hwe/sammo/Event/Action/CreateAdminNPC.php`

---

### 베팅 시스템 (P2 - 부가 효과)

#### OpenNationBetting

- **트리거**: 특수 조건
- **효과**:
  - 천통국/최후 N국 베팅 오픈
  - 모든 유저에게 알림 발송
  - FinishNationBetting 이벤트 등록
- **관련 엔티티**: General, Nation, Betting
- **RNG**: 없음
- **레거시**: `legacy/hwe/sammo/Event/Action/OpenNationBetting.php`

#### FinishNationBetting

- **트리거**: DestroyNation (남은 국가 수 조건)
- **효과**:
  - 베팅 결과 확정
  - 당첨자에게 보상 지급
- **관련 엔티티**: General, Nation, Betting
- **RNG**: 없음
- **레거시**: `legacy/hwe/sammo/Event/Action/FinishNationBetting.php`

---

### 유니크 아이템 시스템 (P2 - 부가 효과)

#### LostUniqueItem

- **트리거**: Month (특수 조건)
- **효과**:
  - 일정 확률로 유저 장수가 유니크 아이템 분실
  - 분실 로그 기록
- **관련 엔티티**: General, Item
- **RNG**: 예 (분실 확률용)
- **레거시**: `legacy/hwe/sammo/Event/Action/LostUniqueItem.php`

---

### 상속 포인트 시스템 (P2 - 부가 효과)

#### MergeInheritPointRank

- **트리거**: Month
- **효과**:
  - 상속 포인트 랭킹 데이터 집계
  - 획득/소비 포인트 통합
- **관련 엔티티**: General, RankData
- **RNG**: 없음
- **레거시**: `legacy/hwe/sammo/Event/Action/MergeInheritPointRank.php`

---

### 정찰 시스템 (P2 - 부가 효과)

#### BlockScoutAction

- **트리거**: 특수 조건
- **효과**: 전체 국가 정찰 활성화 (scout=1)
- **관련 엔티티**: Nation
- **RNG**: 없음
- **레거시**: `legacy/hwe/sammo/Event/Action/BlockScoutAction.php`

#### UnblockScoutAction

- **트리거**: 특수 조건
- **효과**: 전체 국가 정찰 비활성화 (scout=0)
- **관련 엔티티**: Nation
- **RNG**: 없음
- **레거시**: `legacy/hwe/sammo/Event/Action/UnblockScoutAction.php`

---

### 기타 시스템

#### AddGlobalBetray

- **트리거**: 특수 조건
- **효과**: 전체 장수 배신 횟수 증가
- **관련 엔티티**: General
- **RNG**: 없음
- **레거시**: `legacy/hwe/sammo/Event/Action/AddGlobalBetray.php`

#### NoticeToHistoryLog

- **트리거**: 특수 조건
- **효과**: 글로벌 히스토리 로그에 메시지 추가
- **관련 엔티티**: HistoryLog
- **RNG**: 없음
- **레거시**: `legacy/hwe/sammo/Event/Action/NoticeToHistoryLog.php`

#### DeleteEvent

- **트리거**: 액션 실행 후
- **효과**: 현재 이벤트를 DB에서 삭제 (1회용 이벤트)
- **관련 엔티티**: Event
- **RNG**: 없음
- **레거시**: `legacy/hwe/sammo/Event/Action/DeleteEvent.php`

---

## Event Conditions (6개)

### Logic

- **역할**: 논리 연산 (and, or, not, xor)
- **사용법**: `["and", condition1, condition2, ...]`
- **레거시**: `legacy/hwe/sammo/Event/Condition/Logic.php`

### Date

- **역할**: 절대 날짜 비교
- **사용법**: `["Date", ">=", 200, 1]` (200년 1월 이상)
- **레거시**: `legacy/hwe/sammo/Event/Condition/Date.php`

### DateRelative

- **역할**: 시작년도 기준 상대 날짜 비교
- **사용법**: `["DateRelative", ">=", 3, null]` (시작 후 3년 이상)
- **레거시**: `legacy/hwe/sammo/Event/Condition/DateRelative.php`

### RemainNation

- **역할**: 남은 국가 수 비교
- **사용법**: `["RemainNation", "<=", 3]` (3국 이하)
- **레거시**: `legacy/hwe/sammo/Event/Condition/RemainNation.php`

### ConstBool

- **역할**: 상수 boolean 반환
- **사용법**: `true` 또는 `false`
- **레거시**: `legacy/hwe/sammo/Event/Condition/ConstBool.php`

### Interval

- **역할**: 주기적 조건 (미구현)
- **상태**: NYI (Not Yet Implemented)
- **레거시**: `legacy/hwe/sammo/Event/Condition/Interval.php`

---

## Static Events (2개)

정적 이벤트는 코드에 하드코딩된 이벤트로, 특정 액션 시 즉시 발동됩니다.

### event\_부대발령즉시집합

- **트리거**: 부대장 발령 시
- **효과**: 부대원들을 발령된 도시로 즉시 이동
- **관련 엔티티**: General, Troop
- **레거시**: `legacy/hwe/sammo/StaticEvent/event_부대발령즉시집합.php`

### event\_부대탑승즉시이동

- **트리거**: 부대 탑승 시
- **효과**: 탑승 장수를 부대장 위치로 즉시 이동
- **관련 엔티티**: General, Troop
- **레거시**: `legacy/hwe/sammo/StaticEvent/event_부대탑승즉시이동.php`

---

## 포팅 우선순위 요약

### P0 - 게임 진행 필수 (9개)

| 이벤트                  | 설명                  |
| ----------------------- | --------------------- |
| ProcessIncome           | 세금/봉급 지급        |
| ProcessWarIncome        | 전쟁 수입/부상병 처리 |
| ProcessSemiAnnual       | 반기 내정/인구 처리   |
| UpdateCitySupply        | 보급 계산             |
| UpdateNationLevel       | 국가 레벨 업데이트    |
| ResetOfficerLock        | 관직 제한 해제        |
| NewYear                 | 새해 처리             |
| AssignGeneralSpeciality | 특기 부여             |
| RandomizeCityTradeRate  | 시세 변동             |

### P1 - 주요 게임플레이 (8개)

| 이벤트                | 설명               |
| --------------------- | ------------------ |
| RaiseDisaster         | 재난/호황          |
| RaiseInvader          | 이민족 침입        |
| AutoDeleteInvader     | 이민족 자동 삭제   |
| InvaderEnding         | 이민족 이벤트 종료 |
| CreateManyNPC         | NPC 일괄 생성      |
| RaiseNPCNation        | NPC 국가 생성      |
| ProvideNPCTroopLeader | NPC 부대장 생성    |
| ChangeCity            | 도시 속성 변경     |

### P2 - 부가 효과 (10개)

| 이벤트                | 설명             |
| --------------------- | ---------------- |
| OpenNationBetting     | 베팅 오픈        |
| FinishNationBetting   | 베팅 종료        |
| LostUniqueItem        | 유니크 분실      |
| MergeInheritPointRank | 상속 포인트 집계 |
| BlockScoutAction      | 정찰 활성화      |
| UnblockScoutAction    | 정찰 비활성화    |
| AddGlobalBetray       | 배신 횟수 증가   |
| NoticeToHistoryLog    | 히스토리 로그    |
| RegNPC                | NPC 등록         |
| RegNeutralNPC         | 중립 NPC 등록    |

### 미구현/보류 (3개)

| 이벤트               | 설명                        |
| -------------------- | --------------------------- |
| CreateAdminNPC       | NYI                         |
| Interval (Condition) | NYI                         |
| DeleteEvent          | 유틸리티 (별도 구현 불필요) |

---

## RNG 사용 이벤트 정리

RNG를 사용하는 이벤트는 결정론적 재현을 위해 시드 컨텍스트가 중요합니다.

| 이벤트                  | 시드 구성                                              |
| ----------------------- | ------------------------------------------------------ |
| RaiseDisaster           | hiddenSeed + 'disaster' + year + month                 |
| RandomizeCityTradeRate  | hiddenSeed + 'randomizeCityTradeRate' + year + month   |
| UpdateNationLevel       | hiddenSeed + 'nationLevelUp' + year + month + nationID |
| AssignGeneralSpeciality | hiddenSeed + 'assignGeneralSpeciality' + year + month  |
| LostUniqueItem          | hiddenSeed + 'LostUniqueItem' + year + month           |
| RaiseInvader            | hiddenSeed + 'RaiseInvader' + year + month             |
| RaiseNPCNation          | hiddenSeed + 'RaiseNPCNation' + year + month           |
| CreateManyNPC           | hiddenSeed + 'CreateManyNPC' + year + month            |
| ProvideNPCTroopLeader   | hiddenSeed + 'troopLeader' + year + month + nationID   |
| RegNPC                  | hiddenSeed + 'RegNPC' + name + nationID + stats        |
| RegNeutralNPC           | hiddenSeed + 'RegNeutralNPC' + name + nationID + stats |

---

## 포팅 시 주의사항

1. **이벤트 순서 보장**: priority 기반 정렬 유지
2. **RNG 결정론**: 동일 시드로 동일 결과 보장
3. **트랜잭션 처리**: 액션 실패 시 롤백 고려
4. **로깅**: ActionLogger 패턴 유지
5. **조건 평가**: Condition 체인 평가 로직 정확히 재현
