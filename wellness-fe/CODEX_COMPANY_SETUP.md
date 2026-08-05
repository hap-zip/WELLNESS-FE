# 회사 Codex 연결 및 재개 가이드

회사 PC에서 회사 계정·정책을 사용하는 Codex로 이 프로젝트를 안전하게 이어서 개발하는 절차입니다.

## 1. 회사 정책 확인

먼저 회사 관리자에게 다음 항목을 확인합니다.

- ChatGPT/Codex 사용이 허용된 저장소인지
- 사용할 회사 ChatGPT workspace와 계정
- 로컬 Codex CLI 또는 IDE 확장 설치 허용 여부
- 소스 코드의 외부 전송·보존·데이터 레지던시 정책
- GitHub 조직 저장소 접근 권한
- 프록시, VPN, 사내 인증서 설정

개인 ChatGPT 계정이나 개인 API 키를 회사 소스 코드 작업에 임의로 사용하지 않습니다.

## 2. Codex 설치와 회사 계정 로그인

회사에서 승인한 Codex CLI, IDE 확장 또는 ChatGPT 데스크톱 앱을 설치합니다.

CLI를 사용하는 경우:

```bash
codex login
codex login status
```

브라우저 로그인에서 반드시 회사 workspace를 선택합니다. 회사가 API 키 인증을 지정했다면 키를 파일이나 명령 기록에 직접 적지 말고 회사 비밀 관리 도구로 `OPENAI_API_KEY`를 주입한 뒤 사용합니다.

```bash
printenv OPENAI_API_KEY | codex login --with-api-key
codex login status
```

주의사항:

- 개인 PC의 `~/.codex/auth.json`을 회사 PC로 복사하지 않습니다.
- 인증 파일, API 키, access token을 Git에 추가하지 않습니다.
- 회사 관리 설정이 로그인 방식이나 workspace를 강제하면 해당 정책을 따릅니다.
- CLI와 IDE 확장은 로컬 로그인 정보를 공유할 수 있으므로 로그아웃 영향도 함께 확인합니다.

## 3. 저장소 준비

```bash
git clone https://github.com/hap-zip/WELLNESS-FE.git
cd WELLNESS-FE/wellness-fe
git switch develop
git pull --ff-only origin develop
```

이미 저장소가 있다면 로컬 변경을 먼저 확인합니다.

```bash
git status -sb
git fetch origin
git switch develop
git pull --ff-only origin develop
```

현재 기준은 PR #46이 병합된 `develop`의 `9e77610`입니다. 회사에서 시작할 때는 항상 원격 `develop`이 더 최신인지 확인합니다.

## 4. 개발 환경 준비

```bash
nvm install
nvm use
node --version
npm ci
```

`.nvmrc` 기준 Node 버전은 `24.15.0`입니다.

Expo Go 실행:

```bash
npx expo start --clear
```

같은 네트워크의 실제 iPhone에서 QR을 열거나 iOS 시뮬레이터를 사용합니다. 프로젝트는 실물 Expo Go 호환을 위해 SDK 54로 고정되어 있습니다.

## 5. Codex가 저장소 지침을 읽는지 확인

Codex는 저장소의 `AGENTS.md`를 작업 시작 시 자동으로 읽습니다. 반드시 `wellness-fe` 디렉터리를 프로젝트 루트로 열고 새 세션을 시작합니다.

CLI 확인 예시:

```bash
codex --ask-for-approval never "현재 저장소에서 읽은 지침과 필수 검증 명령을 요약해"
```

응답에 다음 내용이 포함되어야 합니다.

- Expo SDK 54 버전 문서 확인
- `WORK_HANDOFF.md` 우선 확인
- 네이티브 컨트롤, Safe Area, 접근성, API 교체형 구조
- TypeScript, diff, iOS export 검증

지침이 보이지 않으면 다음을 확인합니다.

- Codex를 `wellness-fe` 디렉터리에서 실행했는지
- 상위 경로나 `~/.codex`에 `AGENTS.override.md`가 있는지
- 기존 Codex 세션이 아닌 새 세션을 열었는지

## 6. 첫 작업 요청

새 회사 Codex 세션에 다음 요청을 그대로 전달합니다.

```text
AGENTS.md, CODEX_COMPANY_SETUP.md, WORK_HANDOFF.md를 전부 읽어.
현재 브랜치와 최신 커밋, working tree 상태를 확인하고 문서와 다른 점이 있으면 Git을 우선해.
현재 구현 범위와 미구현 우선순위를 먼저 요약한 다음, 내가 지정하는 작업을 실제 사용 가능한 React Native 화면으로 구현해.
작업 후 npx tsc --noEmit, git diff --check, iOS Expo export를 실행하고 WORK_HANDOFF.md도 갱신해.
```

이전 채팅 기록 자체는 Git으로 전달되지 않습니다. 지속되어야 하는 결정은 이 저장소의 `AGENTS.md`와 `WORK_HANDOFF.md`에 기록합니다.

## 7. 브랜치와 PR

```bash
git switch develop
git pull --ff-only origin develop
git switch -c feat/<작업명>
```

검증 후:

```bash
git add <작업 파일>
git commit -m "feat: 작업 설명"
git push -u origin feat/<작업명>
```

PR은 저장소 템플릿을 사용하고, 로컬 실행·타입 검사·iOS 번들 확인 여부를 체크합니다.

## 8. 회사와 개인 환경 사이에 공유할 것

Git으로 공유:

- 소스 코드
- `package.json`, `package-lock.json`
- `AGENTS.md`
- `WORK_HANDOFF.md`
- 설계 결정과 공개 가능한 테스트 데이터

공유 금지:

- `.env` 실제 값
- `~/.codex/auth.json`
- 회사 API 키와 access token
- 회사 전용 인증서와 VPN 설정
- 개인 또는 실제 건강 데이터
- 승인되지 않은 사내 문서 원본

## 참고

- Codex는 세션 시작 시 저장소 루트부터 현재 디렉터리까지 `AGENTS.md` 지침을 읽습니다.
- 회사 ChatGPT 로그인은 workspace 권한·보존·관리 정책을 따릅니다.
- API 키 로그인은 회사 ChatGPT workspace 로그인과 동일한 권한 모델이 아닐 수 있습니다.
- 프로젝트별 Codex 설정이 필요해질 때만 저장소의 `.codex` 디렉터리를 추가하고, 인증값은 넣지 않습니다.
