# 몸기록 개발 인계서

회사와 개인 개발 환경의 Codex가 동일한 기준으로 작업을 이어가기 위한 저장소 기준 문서입니다. 마지막 갱신일은 2026-08-05입니다.

## 현재 기준점

- 기준 브랜치: `develop`
- 현재 기준 커밋: `9e77610 Merge pull request #46 from hap-zip/feat/native-ui`
- 완료된 기능 브랜치: `feat/native-ui`
- Expo SDK: `^54.0.36`
- Expo Router: `~6.0.24`
- React Native: `0.81.5`
- Node 기준: `.nvmrc`의 `24.15.0`
- 패키지 설치: `npm ci`

문서보다 Git 이력이 최신이면 Git 상태를 우선하고 이 문서를 함께 갱신합니다.

## 구현 완료 범위

- 인증: 스플래시, 로그인, 회원가입과 입력 검증·로딩 상태
- 온보딩: 서비스 소개, 민감정보 동의, 기본 상태 설정, 건강 데이터 연결 안내
- 네이티브 시간 선택: 취침·기상·알림 시간
- Safe Area와 공통 뒤로가기 UX
- 네이티브 하단 탭: 오늘, 기록, 발견, 나
- 오늘 홈: 상태 요약, 인사이트, 루틴, 수면 차트, 최근 기록
- 데일리 체크 전 과정
  - 자동 건강 기록 확인
  - 컨디션
  - 불편 부위·강도·느낌
  - 수면 만족도·자세·베개
  - 활동량·피부·메모
  - 기록 완료
- 수면 자세별 SVG 일러스트 선택 카드
- SVG 전신 근육 바디맵
  - `react-native-body-highlighter` 기반 근육별 실제 SVG 경로
  - 기록된 근육만 색상 표시·터치 가능
  - 기록 강도에 따라 노랑·주황·빨강 표시
  - 기록 완료 후 홈 재포커스 시 최신 바디맵 조회
  - 활성 근육 상세 바텀시트
- 도메인·서비스·비동기 조회 계층 분리
- 기록 캘린더 (`LOG-01`)
  - 실제 월별 날짜 계산과 이전·다음 달 이동
  - 기록 상태 점과 날짜 선택
  - 월간 기록일·평균 수면·불편일 통계
  - 선택 날짜 요약 및 기록 없는 날짜의 CTA
  - 로딩·오류·빈 상태와 홈 기록 데이터 재조회
- 날짜별 기록 상세 (`LOG-02`)
  - 자동 기록, 불편 부위·강도·느낌, 수면, 활동·피부, 메모 표시
  - 캘린더 선택 날짜와 상세 라우트 연결
  - 로딩·오류·기록 없음 상태와 안전한 뒤로가기
- 발견 (`CON-01`, `CON-02`)
  - 기준 날짜 선택 시 수면·컨디션·활동 차트 동시 갱신
  - 직접 SVG 경로·막대 계산 함수 `mkLine`, `mkBars`
  - 발견 패턴 목록과 근거·비교 차트·생활 제안 상세
- 루틴 (`RTN-01`, `RTN-02`, `RTN-03`)
  - 상태 기반 오늘의 추천, 단계·주의사항 안내
  - 실제 종료 시각 기준 실행 타이머와 일시정지·재개·건너뛰기
  - 실행 중 이탈 확인, 단계별 SVG 동작 안내
  - 완료 결과 저장과 홈 루틴 카드 완료 상태 갱신
- 피드백·지속 신호 (`FDB-01`, `SGN-01`)
  - 루틴 전후 변화, 현재 불편 강도, 메모 저장
  - 악화·고강도 응답 시 반복 근거와 안전 안내로 연결
  - 진단으로 오해되지 않는 생활 참고·의료 상담 안내
- 기록 요약 (`RPT-01`, `RPT-02`)
  - 7·14·30일 기간과 포함 항목 설정
  - 선택 항목만 반영한 요약 카드 생성
  - React Native 네이티브 공유 시트와 기록 탭 진입점

## 데이터 흐름

```text
DailyCheckContext
  → ActivitySkinCheckScreen.submit()
  → wellnessApi.saveDailyCheck(payload)
  → MockWellnessApi의 실행 중 메모리 저장
  → HomeScreen 포커스 시 getHomeSummary() 재조회
  → bodyParts를 bodyHighlights의 muscle slug로 변환
  → HomeAvatar의 SVG 경로 색상·터치 상태 갱신
```

주요 파일:

- `src/context/daily-check-context.tsx` — 작성 중인 체크 데이터
- `src/domain/wellness.ts` — API 교체를 위한 도메인 타입
- `src/services/wellness-api.ts` — 목업 저장소와 바디맵 매핑
- `src/hooks/use-async-data.ts` — 비동기 조회 및 재조회
- `src/pages/home/HomeAvatar.tsx` — SVG 전신 근육 바디맵
- `src/pages/home/HomeScreen.tsx` — 홈 조회와 포커스 갱신
- `src/pages/check/SleepPostureIllustration.tsx` — 수면 자세 벡터

현재 기록 부위 매핑:

| 기록 값 | SVG 근육 |
| --- | --- |
| 목 | `neck` |
| 어깨 | `trapezius`, `deltoids` |
| 허리 | `obliques` |
| 무릎 | `knees` |
| 손목 | `forearm` |
| 기타 | 바디맵 표시 없음 |

## 아직 목업인 부분

- `MockWellnessApi` 데이터는 앱 프로세스를 종료하면 초기화됩니다.
- 인증 요청은 실제 서버와 연결되지 않았습니다.
- HealthKit·Health Connect 실제 권한과 동기화는 구현하지 않았습니다.
- 나 탭은 준비 화면이며 실제 화면 구현이 필요합니다.
- 루틴 실행, 기록 도우미, 알림, 리포트, 설정은 미구현입니다.
- 홈 일부 문구와 날짜는 목업 데이터입니다.
- 허리는 현재 정면 `obliques`로 임시 매핑되어 있습니다. 후면 바디맵 도입 시 `lower-back`으로 교체해야 합니다.
- 바디맵 오른쪽 요약은 첫 번째 활성 근육을 대표 상태로 표시합니다. 복수 부위 UX를 추가로 설계해야 합니다.

## 다음 개발 우선순위

1. `CHAT-01` 기록 도우미 구현
2. 목업 저장소를 영속 저장 또는 실제 HTTP API 구현체로 교체
3. 전면·후면 바디맵 전환과 좌우 부위 구분
4. 복수 활성 근육 요약 UX 정리
5. 나, 설정, 리포트 화면 구현
6. 실제 기기 스크린샷 기반 390×844pt 시각 회귀 확인

## 작업 원칙

- HTML/WebView 복사 대신 React Native 네이티브 컴포넌트를 사용합니다.
- 모든 화면에 Safe Area, 접근성 라벨, 최소 44pt 터치 영역을 적용합니다.
- 입력에는 검증과 로딩·실패 상태를 제공합니다.
- UI에서 서비스 구현체를 직접 하드코딩하지 않고 도메인/API 계약을 통과시킵니다.
- API 응답을 목업하더라도 교체 가능한 저장소 구조를 유지합니다.
- 뒤로가기는 history가 없을 때의 fallback과 입력 손실 확인을 제공합니다.
- 진단이나 치료로 오해될 표현을 추가하지 않습니다.
- Expo 코드를 쓰기 전에 SDK 54 버전 문서를 확인합니다.

## 검증 명령

```bash
npx tsc --noEmit
git diff --check
npx expo export --platform ios --output-dir /tmp/wellness-ios-dist
npx expo-doctor
```

현재 `feat/native-ui` 병합 전 검증 결과:

- TypeScript 검사 통과
- `git diff --check` 통과
- iOS Expo 번들 생성 통과

## 새 작업 시작 절차

```bash
git switch develop
git pull --ff-only origin develop
npm ci
git switch -c feat/<작업명>
```

Codex에 첫 요청으로 다음 문장을 사용합니다.

```text
AGENTS.md와 WORK_HANDOFF.md를 전부 읽고 현재 Git 상태를 확인해.
구현 현황과 다음 우선순위를 요약한 뒤 <작업명>을 실제 사용 가능한 수준으로 구현하고 검증해.
```

작업 후 문서의 기준 커밋·완료 범위·남은 작업을 반드시 갱신합니다.
