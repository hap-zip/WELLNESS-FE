# 몸기록 작업 인계서

회사에서 작업을 중단하고 집의 MacBook Codex에서 이어서 작업할 때 사용하는 문서입니다.

## 현재 기준점

- 기준 브랜치: `develop`
- 현재 구현 브랜치: `feat/check-flow`
- 기준 병합 커밋: `99b93f0 Merge pull request #44 from hap-zip/feat/check-cond`
- 구현 완료 후 다음 작업 브랜치: `feat/records`
- 다음 페이지: `RecordsCalendarScreen` — 기록 캘린더

## 완료된 페이지

- [x] `splash` — 스플래시
- [x] `login` — 로그인
- [x] `signup` — 회원가입
- [x] `intro` — 서비스 안내
- [x] `consent` — 민감정보 동의
- [x] `baseline` — 기본 상태 설정
- [x] `health-connect` — 건강 데이터 연결
- [x] `home` — 오늘 홈
- [x] `check-auto` — 자동 수집 확인
- [x] `check-cond` — 오늘 컨디션
- [x] `check-discomfort` — 불편 부위·강도·느낌
- [x] `check-sleep` — 수면 만족도·자세·베개
- [x] `check-skin` — 활동·피부
- [x] `check-done` — 기록 완료

각 페이지는 다음 구조를 사용합니다.

```text
src/app/<route>.tsx
src/pages/<domain>/<PageName>Screen.tsx
src/pages/<domain>/<page-name>.styles.ts
```

## 다음 작업

### `feat/records`

구현 대상:

- 페이지 ID: `LOG-01`
- 페이지 이름: 기록 캘린더
- 라우트: `/(tabs)/records`
- 화면 파일: `src/pages/records/RecordsCalendarScreen.tsx`
- 스타일 파일: `src/pages/records/records-calendar.styles.ts`

HTML 기준:

- 월별 기록 캘린더
- 날짜별 기록 여부와 선택 상태
- 선택 날짜의 요약 정보
- 하단 탭의 기록 메뉴 연결

## 집에서 환경 맞추기

### 1. 저장소 받기

```bash
git clone <저장소주소>
cd wellness-fe
git switch develop
git pull
```

이미 clone되어 있다면:

```bash
git switch develop
git pull
```

### 2. Node 버전 맞추기

저장소의 `.nvmrc`는 `24.15.0`입니다.

```bash
nvm install
nvm use
node --version
```

출력은 `v24.15.0`이어야 합니다.

### 3. 의존성 설치

`package-lock.json`을 기준으로 설치합니다.

```bash
npm ci
```

### 4. Expo 실행

```bash
npx expo start
```

Expo Go에서 QR을 열거나 웹으로 확인합니다.

## 다음 브랜치 생성

브랜치는 항상 최신 `develop`에서 직접 생성합니다.

```bash
git switch develop
git pull
git switch -c feat/check-cond
```

작업 완료 후:

```bash
git add .
git commit -m "feat: 컨디션 체크 페이지 구현"
git push -u origin feat/check-cond
```

## 검증 명령

현재 프로젝트 전체 타입 검사에는 기존 템플릿 오류가 남아 있습니다.

```bash
npx tsc --noEmit
```

현재 알려진 기존 오류:

- `src/components/animated-icon.web.tsx`의 CSS 모듈 선언 누락
- `src/constants/theme.ts`의 `global.css` side-effect import 선언 누락

새 페이지 구현 후에는 검사 결과에 새 파일 오류가 추가되지 않았는지 확인합니다.

## 원본 디자인 파일

원본 파일은 현재 회사 PC 외부 경로에 있습니다. 집에서도 필요하면 별도로 복사합니다.

- `CODEX_몸기록_Expo_구현요청서.pdf`
- `README.md`
- `Wellness App.dc.html`

프로젝트 내부 기준 문서는 다음과 같습니다.

- `PAGE_SPEC.md` — 페이지명·라우트·파일명·브랜치 명세
- `IMPLEMENTATION_CHECKLIST.md` — 전체 구현 체크리스트

## PR 작성 규칙

커밋·푸시가 끝나면 아래 형식으로 PR 상세내용을 작성합니다.

- 제목: `<type>: 한국어 설명`
- 작업 내용
- 관련 이슈
- 리뷰·실행 확인 체크리스트
- 리뷰어 요청사항
- 스크린샷

## Expo Go 범위

- 프로젝트는 실물 iOS의 최신 Expo Go 호환을 위해 SDK 54를 사용
- 홈 아바타는 `expo-gl`과 `@react-three/fiber/native` 기반 3D mesh를 사용하고 웹·오류 환경에서는 2D로 대체
- 초기 구현은 UI와 더미 데이터 중심
- HealthKit·Health Connect 실제 연동은 아직 하지 않음
- 백그라운드 동기화와 원격 푸시 알림은 추후 Development Build 범위
- 홈 차트와 바디맵은 `react-native-svg` 기반
