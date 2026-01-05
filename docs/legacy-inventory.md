# 레거시 코드베이스 전체 인벤토리

> 생성일: 2026-01-05
> 총 파일 수: 6,006개

## 파일 확장자별 통계

| 확장자 | 파일 수 | 설명 |
|--------|---------|------|
| .jpg | 2,619 | 이미지 (장수/아이템 아이콘) |
| .png | 1,820 | 이미지 (맵/UI) |
| .php | 907 | PHP 소스 코드 |
| .ts | 166 | TypeScript 소스 코드 |
| .gif | 118 | 애니메이션 이미지 |
| .json | 93 | 시나리오/설정 데이터 |
| .webp | 90 | 최적화 이미지 |
| .vue | 84 | Vue 컴포넌트 |
| .scss | 31 | SCSS 스타일 |
| .css | 22 | CSS 스타일 |
| .js | 15 | JavaScript |
| .sql | 5 | 데이터베이스 스키마 |

---

## 디렉토리 구조

```
legacy/
├── hwe/                    # 메인 게임 코드
│   ├── sammo/              # 핵심 도메인 로직 (684 PHP)
│   │   ├── ActionItem/          # 아이템 (161)
│   │   ├── Constraint/          # 제약 조건 (73)
│   │   ├── Command/
│   │   │   ├── General/         # 장수 커맨드 (55)
│   │   │   └── Nation/          # 국가 커맨드 (38)
│   │   ├── WarUnitTrigger/      # 전투 트리거 (36)
│   │   ├── ActionSpecialDomestic/ # 내정 특기 (30)
│   │   ├── Event/
│   │   │   ├── Action/          # 이벤트 액션 (29)
│   │   │   └── Condition/       # 이벤트 조건 (6)
│   │   ├── ActionSpecialWar/    # 전투 특기 (21)
│   │   ├── Enums/               # 열거형 (16)
│   │   ├── ActionNationType/    # 국가 성향 (15)
│   │   ├── DTO/                 # 데이터 전송 객체 (14)
│   │   ├── ActionPersonality/   # 성격 (12)
│   │   ├── GameUnitConstraint/  # 게임 유닛 제약 (11)
│   │   ├── API/                 # API 엔드포인트 (75+)
│   │   ├── GeneralTrigger/      # 장수 트리거 (4)
│   │   ├── ActionScenarioEffect/ # 시나리오 효과 (4)
│   │   ├── GeneralPool/         # 장수 풀 (3)
│   │   ├── Scenario/            # 시나리오 (2)
│   │   ├── ActionCrewType/      # 병종 타입 (2)
│   │   ├── StaticEvent/         # 정적 이벤트 (2)
│   │   ├── TextDecoration/      # 텍스트 장식 (2)
│   │   └── VO/                  # 값 객체 (1)
│   ├── ts/                 # 프론트엔드 TypeScript (166)
│   ├── scenario/           # 시나리오 데이터 (82 JSON)
│   ├── css/                # 스타일시트
│   ├── scss/               # SCSS 소스
│   ├── js/                 # JavaScript
│   ├── sql/                # DB 스키마
│   ├── templates/          # HTML 템플릿
│   └── *.php               # 루트 PHP 파일 (110)
├── i_entrance/             # 입장/로그인 (15 PHP)
├── f_install/              # 설치 (5 PHP)
├── oauth_kakao/            # 카카오 OAuth
├── tests/                  # 테스트 (2 PHP)
├── d_pic/                  # 이미지 리소스 (4,647)
├── e_lib/                  # 외부 라이브러리
└── src/                    # 추가 소스
```

---

## 상세 파일 목록

### 1. ActionItem (161개) - 아이템 시스템

#### 무기 (15등급)
| 파일 | 아이템명 |
|------|----------|
| che_무기_01_단도.php | 단도 |
| che_무기_02_단궁.php | 단궁 |
| che_무기_03_단극.php | 단극 |
| che_무기_04_목검.php | 목검 |
| che_무기_05_죽창.php | 죽창 |
| che_무기_06_소부.php | 소부 |
| che_무기_07_*.php | 동추, 맥궁, 철쇄, 철편 |
| che_무기_08_*.php | 유성추, 철질여골 |
| che_무기_09_*.php | 동호비궁, 쌍철극 |
| che_무기_10_*.php | 대부, 삼첨도 |
| che_무기_11_*.php | 고정도, 이광궁 |
| che_무기_12_*.php | 철척사모, 칠성검 |
| che_무기_13_*.php | 사모, 양유기궁 |
| che_무기_14_*.php | 방천화극, 언월도 |
| che_무기_15_*.php | 의천검, 청홍검 |

#### 명마 (15등급)
| 파일 | 아이템명 |
|------|----------|
| che_명마_01_노기.php ~ che_명마_15_적토마.php | 노기 ~ 적토마/한혈마 |

#### 서적 (15등급)
| 파일 | 아이템명 |
|------|----------|
| che_서적_01_효경전.php ~ che_서적_15_손자병법.php | 효경전 ~ 손자병법/노자 |

#### 특수 아이템
| 파일 | 효과 |
|------|------|
| che_계략_삼략.php | 계략 강화 |
| che_계략_육도.php | 계략 강화 |
| che_반계_백우선.php | 반계 강화 |
| che_반계_파초선.php | 반계 강화 |
| che_필살_둔갑천서.php | 필살 강화 |
| che_회피_둔갑천서.php | 회피 강화 |
| che_회피_태평요술.php | 회피 강화 |
| che_의술_*.php | 치료 관련 |
| che_치료_*.php | 부상 치료 |
| event_충차.php | 공성 장비 |

---

### 2. Constraint (73개) - 제약 조건 시스템

#### 외교/전쟁 관련
| 파일 | 설명 |
|------|------|
| AllowDiplomacyBetweenStatus.php | 외교 상태 허용 |
| AllowDiplomacyStatus.php | 외교 상태 체크 |
| AllowDiplomacyWithTerm.php | 기간 조건 외교 |
| AllowWar.php | 전쟁 허용 조건 |
| DisallowDiplomacyBetweenStatus.php | 외교 불가 상태 |
| DisallowDiplomacyStatus.php | 외교 불가 체크 |

#### 장수 관련
| 파일 | 설명 |
|------|------|
| BeChief.php | 군주 여부 |
| BeLord.php | 태수 여부 |
| BeNeutral.php | 재야 여부 |
| NotChief.php | 군주 아님 |
| NotLord.php | 태수 아님 |
| NotBeNeutral.php | 재야 아님 |
| ReqGeneralGold.php | 금 보유량 |
| ReqGeneralRice.php | 쌀 보유량 |
| ReqGeneralCrew.php | 병력 보유 |
| ReqGeneralValue.php | 장수 스탯 요구 |

#### 국가 관련
| 파일 | 설명 |
|------|------|
| ReqNationGold.php | 국가 금 보유량 |
| ReqNationRice.php | 국가 쌀 보유량 |
| ReqNationValue.php | 국가 스탯 요구 |
| ReqNationAuxValue.php | 국가 보조 스탯 |

#### 도시 관련
| 파일 | 설명 |
|------|------|
| NearCity.php | 인접 도시 |
| NearNation.php | 인접 국가 |
| NeutralCity.php | 공백지 |
| OccupiedCity.php | 점령된 도시 |
| SuppliedCity.php | 보급 가능 도시 |
| HasRoute.php | 경로 존재 |
| HasRouteWithEnemy.php | 적과 경로 존재 |

---

### 3. Command/General (55개) - 장수 커맨드

| 파일 | 커맨드명 | 상태 |
|------|----------|------|
| 휴식.php | 휴식 | ✅ 구현 |
| che_건국.php | 건국 | ✅ 구현 |
| che_거병.php | 거병 | ✅ 구현 |
| che_견문.php | 견문 | ✅ 구현 |
| che_군량매매.php | 군량매매 | ✅ 구현 |
| che_귀환.php | 귀환 | ✅ 구현 |
| che_기술연구.php | 기술연구 | ✅ 구현 |
| che_농지개간.php | 농지개간 | ✅ 구현 |
| che_단련.php | 단련 | ✅ 구현 |
| che_등용.php | 등용 | ✅ 구현 |
| che_등용수락.php | 등용수락 | ✅ 구현 |
| che_모병.php | 모병 | ✅ 구현 |
| che_사기진작.php | 사기진작 | ✅ 구현 |
| che_상업투자.php | 상업투자 | ✅ 구현 |
| che_선동.php | 선동 | ✅ 구현 |
| che_선양.php | 선양 | ✅ 구현 |
| che_성벽보수.php | 성벽보수 | ✅ 구현 |
| che_소집해제.php | 소집해제 | ✅ 구현 |
| che_수비강화.php | 수비강화 | ✅ 구현 |
| che_숙련전환.php | 숙련전환 | ✅ 구현 |
| che_요양.php | 요양 | ✅ 구현 |
| che_이동.php | 이동 | ✅ 구현 |
| che_인재탐색.php | 인재탐색 | ✅ 구현 |
| che_임관.php | 임관 | ✅ 구현 |
| che_장비매매.php | 장비매매 | ✅ 구현 |
| che_전투태세.php | 전투태세 | ✅ 구현 |
| che_정착장려.php | 정착장려 | ✅ 구현 |
| che_주민선정.php | 주민선정 | ✅ 구현 |
| che_증여.php | 증여 | ✅ 구현 |
| che_집합.php | 집합 | ✅ 구현 |
| che_징병.php | 징병 | ✅ 구현 |
| che_첩보.php | 첩보 | ✅ 구현 |
| che_출병.php | 출병 | ✅ 구현 |
| che_치안강화.php | 치안강화 | ✅ 구현 |
| che_파괴.php | 파괴 | ✅ 구현 |
| che_하야.php | 하야 | ✅ 구현 |
| che_해산.php | 해산 | ✅ 구현 |
| che_헌납.php | 헌납 | ✅ 구현 |
| che_화계.php | 화계 | ✅ 구현 |
| che_훈련.php | 훈련 | ✅ 구현 |
| che_강행.php | 강행 | ✅ 구현 |
| che_접경귀환.php | 접경귀환 | ✅ 구현 |
| che_탈취.php | 탈취 | ✅ 구현 |
| cr_맹훈련.php | 맹훈련 | ✅ 구현 |
| che_NPC능동.php | NPC능동 | ⚠️ 부분 |
| che_내정특기초기화.php | 내정특기초기화 | ✅ 구현 |
| che_전투특기초기화.php | 전투특기초기화 | ✅ 구현 |
| che_랜덤임관.php | 랜덤임관 | ⚠️ 부분 |
| che_모반시도.php | 모반시도 | ⚠️ 부분 |
| che_무작위건국.php | 무작위건국 | ⚠️ 부분 |
| che_물자조달.php | 물자조달 | ⚠️ 부분 |
| che_방랑.php | 방랑 | ⚠️ 부분 |
| che_은퇴.php | 은퇴 | ⚠️ 부분 |
| che_장수대상임관.php | 장수대상임관 | ⚠️ 부분 |
| cr_건국.php | 건국 (CR) | ⚠️ 부분 |

---

### 4. Command/Nation (38개) - 국가 커맨드

| 파일 | 커맨드명 | 상태 |
|------|----------|------|
| 휴식.php | 휴식 | ✅ 구현 |
| che_천도.php | 천도 | ✅ 구현 |
| che_국기변경.php | 국기변경 | ✅ 구현 |
| che_국호변경.php | 국호변경 | ✅ 구현 |
| che_포상.php | 포상 | ✅ 구현 |
| che_몰수.php | 몰수 | ✅ 구현 |
| che_선전포고.php | 선전포고 | ✅ 구현 |
| che_불가침제의.php | 불가침제의 | ✅ 구현 |
| che_불가침수락.php | 불가침수락 | ✅ 구현 |
| che_종전제의.php | 종전제의 | ✅ 구현 |
| che_종전수락.php | 종전수락 | ✅ 구현 |
| che_증축.php | 증축 | ✅ 구현 |
| che_감축.php | 감축 | ✅ 구현 |
| che_발령.php | 발령 | ✅ 구현 |
| che_물자원조.php | 물자원조 | ✅ 구현 |
| che_급습.php | 급습 | ❌ 미구현 |
| che_수몰.php | 수몰 | ❌ 미구현 |
| che_백성동원.php | 백성동원 | ❌ 미구현 |
| che_의병모집.php | 의병모집 | ❌ 미구현 |
| che_초토화.php | 초토화 | ❌ 미구현 |
| che_허보.php | 허보 | ❌ 미구현 |
| che_피장파장.php | 피장파장 | ❌ 미구현 |
| che_필사즉생.php | 필사즉생 | ❌ 미구현 |
| che_이호경식.php | 이호경식 | ❌ 미구현 |
| che_부대탈퇴지시.php | 부대탈퇴지시 | ❌ 미구현 |
| che_불가침파기제의.php | 불가침파기제의 | ❌ 미구현 |
| che_불가침파기수락.php | 불가침파기수락 | ❌ 미구현 |
| che_무작위수도이전.php | 무작위수도이전 | ❌ 미구현 |
| cr_인구이동.php | 인구이동 | ❌ 미구현 |
| event_극병연구.php | 극병연구 | ❌ 미구현 |
| event_대검병연구.php | 대검병연구 | ❌ 미구현 |
| event_무희연구.php | 무희연구 | ❌ 미구현 |
| event_산저병연구.php | 산저병연구 | ❌ 미구현 |
| event_상병연구.php | 상병연구 | ❌ 미구현 |
| event_원융노병연구.php | 원융노병연구 | ❌ 미구현 |
| event_음귀병연구.php | 음귀병연구 | ❌ 미구현 |
| event_화륜차연구.php | 화륜차연구 | ❌ 미구현 |
| event_화시병연구.php | 화시병연구 | ❌ 미구현 |

---

### 5. WarUnitTrigger (36개) - 전투 트리거

| 파일 | 설명 | 상태 |
|------|------|------|
| che_필살시도.php | 필살 시도 | ❌ |
| che_필살발동.php | 필살 발동 | ❌ |
| che_회피시도.php | 회피 시도 | ❌ |
| che_회피발동.php | 회피 발동 | ❌ |
| che_계략시도.php | 계략 시도 | ❌ |
| che_계략발동.php | 계략 발동 | ❌ |
| che_계략실패.php | 계략 실패 | ❌ |
| che_저격시도.php | 저격 시도 | ❌ |
| che_저격발동.php | 저격 발동 | ❌ |
| che_반계시도.php | 반계 시도 | ❌ |
| che_반계발동.php | 반계 발동 | ❌ |
| che_위압시도.php | 위압 시도 | ❌ |
| che_위압발동.php | 위압 발동 | ❌ |
| che_약탈시도.php | 약탈 시도 | ❌ |
| che_약탈발동.php | 약탈 발동 | ❌ |
| che_선제사격시도.php | 선제사격 시도 | ❌ |
| che_선제사격발동.php | 선제사격 발동 | ❌ |
| che_돌격지속.php | 돌격 지속 | ❌ |
| che_궁병선제사격.php | 궁병 선제사격 | ❌ |
| che_전투치료시도.php | 전투치료 시도 | ❌ |
| che_전투치료발동.php | 전투치료 발동 | ❌ |
| che_저지시도.php | 저지 시도 | ❌ |
| che_저지발동.php | 저지 발동 | ❌ |
| che_격노시도.php | 격노 시도 | ❌ |
| che_격노발동.php | 격노 발동 | ❌ |
| che_부상무효.php | 부상 무효 | ❌ |
| che_성벽부상무효.php | 성벽 부상 무효 | ❌ |
| che_퇴각부상무효.php | 퇴각 부상 무효 | ❌ |
| che_방어력증가5p.php | 방어력 5% 증가 | ❌ |
| che_필살강화_회피불가.php | 필살강화/회피불가 | ❌ |
| che_전멸시페이즈증가.php | 전멸시 페이즈 증가 | ❌ |
| che_기병병종전투.php | 기병 병종 전투 | ❌ |
| event_충차아이템소모.php | 충차 소모 | ❌ |
| 능력치변경.php | 능력치 변경 | ❌ |
| 전투력보정.php | 전투력 보정 | ❌ |
| WarActivateSkills.php | 스킬 활성화 | ❌ |

---

### 6. ActionSpecialWar (21개) - 전투 특기

| 파일 | 특기명 | 상태 |
|------|--------|------|
| None.php | 없음 | ✅ (기본) |
| che_격노.php | 격노 | ❌ |
| che_견고.php | 견고 | ❌ |
| che_공성.php | 공성 | ❌ |
| che_궁병.php | 궁병 | ❌ |
| che_귀병.php | 귀병 | ❌ |
| che_기병.php | 기병 | ❌ |
| che_돌격.php | 돌격 | ❌ |
| che_무쌍.php | 무쌍 | ❌ |
| che_반계.php | 반계 | ❌ |
| che_보병.php | 보병 | ❌ |
| che_신산.php | 신산 | ❌ |
| che_신중.php | 신중 | ❌ |
| che_위압.php | 위압 | ❌ |
| che_의술.php | 의술 | ❌ |
| che_저격.php | 저격 | ❌ |
| che_집중.php | 집중 | ❌ |
| che_징병.php | 징병 | ❌ |
| che_척사.php | 척사 | ❌ |
| che_필살.php | 필살 | ❌ |
| che_환술.php | 환술 | ❌ |

---

### 7. ActionSpecialDomestic (30개) - 내정 특기

#### 기본 내정 특기 (9개)
| 파일 | 특기명 | 상태 |
|------|--------|------|
| None.php | 없음 | ✅ (기본) |
| che_경작.php | 경작 | ❌ |
| che_거상.php | 거상 | ❌ |
| che_귀모.php | 귀모 | ❌ |
| che_발명.php | 발명 | ❌ |
| che_상재.php | 상재 | ❌ |
| che_수비.php | 수비 | ❌ |
| che_인덕.php | 인덕 | ❌ |
| che_축성.php | 축성 | ❌ |
| che_통찰.php | 통찰 | ❌ |

#### 이벤트 특기 (21개)
- che_event_격노.php ~ che_event_환술.php (전투 특기의 내정 버전)

---

### 8. ActionNationType (15개) - 국가 성향

| 파일 | 성향명 | 상태 |
|------|--------|------|
| None.php | 없음 | ❌ |
| che_덕가.php | 덕가 | ❌ |
| che_도가.php | 도가 | ❌ |
| che_도적.php | 도적 | ❌ |
| che_명가.php | 명가 | ❌ |
| che_묵가.php | 묵가 | ❌ |
| che_법가.php | 법가 | ❌ |
| che_병가.php | 병가 | ❌ |
| che_불가.php | 불가 | ❌ |
| che_오두미도.php | 오두미도 | ❌ |
| che_유가.php | 유가 | ❌ |
| che_음양가.php | 음양가 | ❌ |
| che_종횡가.php | 종횡가 | ❌ |
| che_중립.php | 중립 | ❌ |
| che_태평도.php | 태평도 | ❌ |

---

### 9. ActionPersonality (12개) - 장수 성격

| 파일 | 성격명 |
|------|--------|
| None.php | 없음 |
| che_대의.php | 대의 |
| che_안전.php | 안전 |
| che_왕좌.php | 왕좌 |
| che_유지.php | 유지 |
| che_은둔.php | 은둔 |
| che_의협.php | 의협 |
| che_재간.php | 재간 |
| che_정복.php | 정복 |
| che_출세.php | 출세 |
| che_패권.php | 패권 |
| che_할거.php | 할거 |

---

### 10. Event/Action (29개) - 이벤트 액션

| 파일 | 설명 |
|------|------|
| AddGlobalBetray.php | 배반 이벤트 추가 |
| AssignGeneralSpeciality.php | 특기 부여 |
| AutoDeleteInvader.php | 이민족 자동 삭제 |
| CreateAdminNPC.php | 관리자 NPC 생성 |
| CreateManyNPC.php | 다수 NPC 생성 |
| FinishNationBetting.php | 국가 배팅 종료 |
| InvaderEnding.php | 이민족 엔딩 |
| MergeInheritPointRank.php | 유산 포인트 병합 |
| NewYear.php | 새해 이벤트 |
| OpenNationBetting.php | 국가 배팅 시작 |
| ProcessIncome.php | 수입 처리 |
| ProcessSemiAnnual.php | 반기 처리 |
| ProcessWarIncome.php | 전쟁 수입 |
| ProvideNPCTroopLeader.php | NPC 부대장 제공 |
| RaiseDisaster.php | 재해 발생 |
| RaiseInvader.php | 이민족 발생 |
| RaiseNPCNation.php | NPC 국가 발생 |
| RandomizeCityTradeRate.php | 도시 교역률 랜덤화 |
| RegNPC.php | NPC 등록 |
| RegNeutralNPC.php | 재야 NPC 등록 |
| UpdateCitySupply.php | 도시 보급 갱신 |
| UpdateNationLevel.php | 국가 레벨 갱신 |

---

### 11. Enums (16개) - 열거형

| 파일 | 설명 |
|------|------|
| APIRecoveryType.php | API 복구 타입 |
| AuctionType.php | 경매 타입 |
| CityColumn.php | 도시 컬럼 |
| EventTarget.php | 이벤트 대상 |
| GeneralColumn.php | 장수 컬럼 |
| GeneralQueryMode.php | 장수 쿼리 모드 |
| GeneralStorKey.php | 장수 저장 키 |
| InheritanceKey.php | 유산 키 |
| MessageType.php | 메시지 타입 |
| NationAuxKey.php | 국가 보조 키 |
| PenaltyKey.php | 페널티 키 |
| RankColumn.php | 랭크 컬럼 |
| ResourceType.php | 자원 타입 |
| TableName.php | 테이블 이름 |

---

### 12. API Endpoints (75+개)

#### /API/General (8개)
- BuildNationCandidate, DieOnPrestart, DropItem, GetCommandTable
- GetFrontInfo, GetGeneralLog, InstantRetreat, Join

#### /API/Nation (11개)
- GeneralList, GetGeneralLog, GetNationInfo, SetBill
- SetBlockScout, SetBlockWar, SetNotice, SetRate
- SetScoutMsg, SetSecretLimit, SetTroopName

#### /API/Global (12개)
- ExecuteEngine, GeneralList, GetCachedMap, GetConst
- GetCurrentHistory, GetDiplomacy, GetGlobalMenu
- GetHistory, GetMap, GetNationList, GetRecentRecord

#### /API/Command (5개)
- GetReservedCommand, PushCommand, RepeatCommand
- ReserveBulkCommand, ReserveCommand

#### /API/Auction (9개)
- BidBuyRiceAuction, BidSellRiceAuction, BidUniqueAuction
- GetActiveResourceAuctionList, GetUniqueItemAuctionDetail/List
- OpenBuyRiceAuction, OpenSellRiceAuction, OpenUniqueAuction

---

### 13. 시나리오 데이터 (82 JSON)

| 패턴 | 수량 | 설명 |
|------|------|------|
| scenario_0.json ~ scenario_1.json | 2 | 기본 시나리오 |
| scenario_9XX.json | 6 | 900년대 시나리오 |
| scenario_1XXX.json | 6 | 1000년대 시나리오 |
| scenario_2XXX.json | 68+ | 2000년대 시나리오 |

#### 맵 정의 (8개)
- che.php, chess.php, cr.php, ludo_rathowm.php
- miniche.php, miniche_b.php, miniche_clean.php, pokemon_v1.php

#### 유닛 정의 (7개)
- basic.php, che.php, che_except_siege.php, cr.php
- event_more_crewtype.php, ludo_rathowm.php, siegetank.php

---

### 14. TypeScript/Vue 프론트엔드 (166 TS + 84 Vue)

#### 페이지 컴포넌트 (19개)
- PageFront.vue, PageJoin.vue, PageBoard.vue
- PageHistory.vue, PageTroop.vue, PageVote.vue
- PageAuction.vue, PageChiefCenter.vue, PageBattleCenter.vue
- PageNationGeneral.vue, PageNationBetting.vue
- PageNationStratFinan.vue, PageGlobalDiplomacy.vue
- PageCachedMap.vue, PageInheritPoint.vue, PageNPCControl.vue

#### 공통 컴포넌트 (35개)
- MapViewer.vue, MapCityBasic.vue, MapCityDetail.vue
- GeneralBasicCard.vue, GeneralList.vue, GeneralLiteCard.vue
- NationBasicCard.vue, CityBasicCard.vue
- CommandSelectForm.vue, MessagePanel.vue
- GameInfo.vue, GameBottomBar.vue, TopBackBar.vue

#### 유틸리티 (50+개)
- JosaUtil.ts, LiteHashDRBG.ts, RandUtil.ts
- callSammoAPI.ts, formatTime.ts, parseTime.ts

---

## 구현 우선순위 매트릭스

| 카테고리 | 파일 수 | 중요도 | 난이도 |
|----------|---------|--------|--------|
| WarUnitTrigger | 36 | ⭐⭐⭐⭐⭐ | 높음 |
| ActionSpecialWar | 21 | ⭐⭐⭐⭐⭐ | 중간 |
| Command/Nation | 20 (미구현) | ⭐⭐⭐⭐ | 중간 |
| ActionNationType | 15 | ⭐⭐⭐⭐ | 낮음 |
| ActionItem | 161 | ⭐⭐⭐ | 낮음 |
| ActionSpecialDomestic | 30 | ⭐⭐⭐ | 낮음 |
| Constraint | 73 | ⭐⭐⭐ | 중간 |
| ActionPersonality | 12 | ⭐⭐ | 낮음 |
| Event/Action | 29 | ⭐⭐ | 중간 |
