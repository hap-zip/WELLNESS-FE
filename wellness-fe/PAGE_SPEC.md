# 몸기록 페이지 명세

화면 ID는 QA·기획 문서와 연결하기 위한 식별자이고, 실제 개발에서는 페이지의 역할이 드러나는 이름을 사용한다.

## 개발 원칙

- `AUTH-01` 같은 ID를 컴포넌트명·파일명·브랜치명으로 단독 사용하지 않는다.
- 라우트 파일은 얇게 유지하고 페이지 화면과 스타일을 분리한다.
- 모든 페이지는 다음 구조를 기본으로 한다.

```text
src/app/<route>.tsx                         # Expo Router route
src/pages/<domain>/<PageName>Screen.tsx     # page UI
src/pages/<domain>/<page-name>.styles.ts    # page-only StyleSheet
```

- 공통 컴포넌트는 실제로 2개 이상의 페이지에서 반복될 때만 `src/components`로 이동한다.
- 스타일은 페이지별 `StyleSheet` 파일에 작성한다. 페이지 파일 안에 대형 `StyleSheet.create`를 작성하지 않는다.
- 화면 ID는 각 페이지의 `specId` 주석 또는 명세 문서에서만 사용한다.

## 라우트·페이지 목록

### 인증

| ID | 페이지 이름 | Expo Router 경로 | 화면 파일 | 브랜치 |
|---|---|---|---|---|
| AUTH-01 | 스플래시 | `/(auth)/splash` | `SplashScreen` | `feat/splash` |
| AUTH-02 | 로그인 | `/(auth)/login` | `LoginScreen` | `feat/login` |
| AUTH-03 | 회원가입 | `/(auth)/signup` | `SignupScreen` | `feat/signup` |

### 온보딩

| ID | 페이지 이름 | Expo Router 경로 | 화면 파일 | 브랜치 |
|---|---|---|---|---|
| ONB-01 | 서비스 안내 | `/(onboarding)/intro` | `OnboardingIntroScreen` | `feat/intro` |
| ONB-02 | 민감정보 동의 | `/(onboarding)/consent` | `ConsentScreen` | `feat/consent` |
| ONB-02B | 기본 상태 설정 | `/(onboarding)/baseline` | `BaselineSetupScreen` | `feat/baseline` |
| ONB-03 | 건강 데이터 연결 | `/(onboarding)/health-connect` | `HealthConnectScreen` | `feat/health` |

### 오늘·기록

| ID | 페이지 이름 | Expo Router 경로 | 화면 파일 | 브랜치 |
|---|---|---|---|---|
| HOME-01 | 오늘 홈 | `/(tabs)/home` | `HomeScreen` | `feat/home` |
| CHK-00 | 수면·걸음 자동수집 확인 | `/check/auto` | `AutoCheckScreen` | `feat/check-auto` |
| CHK-00B | 오늘 컨디션 | `/check/condition` | `ConditionCheckScreen` | `feat/check-cond` |
| CHK-01A | 불편 부위·강도 | `/check/discomfort` | `DiscomfortCheckScreen` | `feat/check-discomfort` |
| CHK-01B | 수면 자세·만족도 | `/check/sleep` | `SleepCheckScreen` | `feat/check-sleep` |
| CHK-01C | 활동·피부 | `/check/activity-skin` | `ActivitySkinCheckScreen` | `feat/check-skin` |
| CHK-02 | 기록 완료 | `/check/complete` | `CheckCompleteScreen` | `feat/check-done` |
| LOG-01 | 기록 캘린더 | `/(tabs)/records` | `RecordsCalendarScreen` | `feat/records` |
| LOG-02 | 날짜별 기록 상세 | `/records/[date]` | `RecordDetailScreen` | `feat/record-detail` |

### 발견

| ID | 페이지 이름 | Expo Router 경로 | 화면 파일 | 브랜치 |
|---|---|---|---|---|
| CON-01 | 발견 홈 | `/(tabs)/discover` | `DiscoverScreen` | `feat/discover` |
| CON-02 | 패턴 상세 | `/discover/pattern/[patternId]` | `PatternDetailScreen` | `feat/pattern` |

### 루틴·피드백

| ID | 페이지 이름 | Expo Router 경로 | 화면 파일 | 브랜치 |
|---|---|---|---|---|
| RTN-01 | 오늘의 루틴 | `/routine` | `RoutineIntroScreen` | `feat/routine` |
| RTN-02 | 루틴 실행 | `/routine/run` | `RoutineRunScreen` | `feat/routine-run` |
| RTN-03 | 루틴 완료 | `/routine/complete` | `RoutineCompleteScreen` | `feat/routine-done` |
| FDB-01 | 루틴 효과 피드백 | `/routine/feedback` | `RoutineFeedbackScreen` | `feat/feedback` |

### 안전·공유

| ID | 페이지 이름 | Expo Router 경로 | 화면 파일 | 브랜치 |
|---|---|---|---|---|
| SGN-01 | 지속 신호 안내 | `/safety/signal` | `SignalScreen` | `feat/signal` |
| RPT-01 | 기록 요약 설정 | `/reports/setup` | `ReportSetupScreen` | `feat/report-setup` |
| RPT-02 | 기록 요약 미리보기 | `/reports/preview` | `ReportPreviewScreen` | `feat/report` |

### 보조·설정

| ID | 페이지 이름 | Expo Router 경로 | 화면 파일 | 브랜치 |
|---|---|---|---|---|
| CHAT-01 | 기록 도우미 | `/assistant` | `AssistantScreen` | `feat/assistant` |
| MYP-01 | 나 | `/(tabs)/me` | `MeScreen` | `feat/me` |
| SET-01 | 건강 데이터 설정 | `/settings/health` | `HealthSettingsScreen` | `feat/settings-health` |
| SET-02 | 알림 설정 | `/settings/notifications` | `NotificationSettingsScreen` | `feat/notifications` |
| SET-03 | 동의·데이터 관리 | `/settings/data` | `DataSettingsScreen` | `feat/settings-data` |
| EMP-01 | 빈 상태·예외 안내 | `/empty-states` | `EmptyStatesScreen` | `feat/empty` |

## 페이지 파일 예시

로그인 페이지는 다음처럼 구성한다.

```text
src/app/(auth)/login.tsx
src/pages/auth/LoginScreen.tsx
src/pages/auth/login.styles.ts
```

라우트 파일에는 화면 조합을 넣지 않는다.

```tsx
import LoginScreen from '@/pages/auth/LoginScreen';

export default function LoginRoute() {
  return <LoginScreen />;
}
```

## 페이지 구현 체크리스트

- [ ] 페이지 이름과 역할 확정
- [ ] HTML의 해당 페이지 섹션 확인
- [ ] 라우트 파일 생성
- [ ] 페이지 화면 파일 생성
- [ ] 페이지 전용 스타일 파일 생성
- [ ] 필요한 공통 컴포넌트만 분리
- [ ] HTML과 동일한 텍스트·순서·색상·간격 구현
- [ ] 페이지의 이동·뒤로가기·CTA 동작 구현
- [ ] 접근성 라벨 및 44px 터치 영역 확인
- [ ] Expo Go에서 실제 렌더링 확인
- [ ] 체크리스트 갱신 후 화면 브랜치에 커밋

## 구현 순서

1. `splash`
2. `login`
3. `signup`
4. `intro`
5. `consent`
6. `baseline`
7. `health-connect`
8. `home`
9. `check-auto` → `check-cond` → `check-discomfort` → `check-sleep` → `check-skin` → `check-done`
10. `records` → `record-detail`
11. `discover` → `pattern`
12. `routine` → `routine-run` → `routine-done` → `feedback`
13. `signal` → `report-setup` → `report`
14. `assistant` → `me` → 설정 페이지들 → `empty`

## 현재 상태

- [x] 페이지 명세 초안 작성
- [ ] 페이지 명세 검토·확정
- [x] 기존 `AUTH-01` 임시 구현 정리
- [x] `splash` 페이지를 명세 구조로 재구현
- [x] `login` 페이지 구현
- [x] `signup` 페이지 구현
- [x] `intro` 페이지 구현
- [x] `consent` 페이지 구현
- [x] `baseline` 페이지 구현
- [x] `health-connect` 페이지 구현
- [x] `home` 페이지 구현
