# 몸기록 문서 기준표

점검일: 2026-08-09

저장소의 Markdown 문서를 전수 검사했다. 아래 우선순위와 역할 밖의 문서는 UI 판단 근거로 사용할 수 없다.

## UI 문서 우선순위

1. `REDESIGN_V3.md` — 전면 재설계 선언, 화면별 새 구조
2. `DESIGN_SYSTEM.md` — 강제 규칙과 금지 목록
3. `design-system/default/MASTER.md` — 구현 중 빠른 참조용 요약
4. `NEXT_STEPS.md` — 미완료 상태와 실행 순서
5. `UI_UX_AUDIT.md` — 현재 코드의 V3 적용 판정
6. `WWIT_UI_BENCHMARK.md` — 레퍼런스 분해 근거
7. `RELEASE_QA.md` — V3 구현 후 검증

## 기능·개발 문서

| 문서 | 역할 | UI 판단 가능 여부 |
|---|---|---|
| `FINAL_FUNCTION_AUDIT.md` | 최종 PDF 기능 대비 | 불가 |
| `PAGE_SPEC.md` | 라우트와 화면 파일 대응 | 불가 |
| `IMPLEMENTATION_CHECKLIST.md` | 기능 골격 추적 | 불가 |
| `API_SPEC.md` | 백엔드 API 목록 | 불가 |
| `MASTER_ROADMAP.md` | 출시까지 작업 의존성 | V3 문서 링크만 가능 |
| `WORK_HANDOFF.md` | 환경과 기능 인계 | V3 문서 링크만 가능 |
| `CODEX_COMPANY_SETUP.md` | 회사 환경 연결 | 불가 |
| `README.md` | 프로젝트 진입점 | 불가 |
| `AGENTS.md` | 작업 강제 규칙 | V3 우선순위 강제 |
| `CLAUDE.md` | `AGENTS.md` 위임 | 불가 |

## 폐기 문서

- `REDESIGN_V2.md`는 폐기 안내만 남긴다. 과거 팔레트, 컴포넌트, 완료 체크를 복원하지 않는다.

## 체크 상태 해석

- 기능 문서의 `[x]`: 기능 골격이나 경로가 존재함
- V3 실행 문서의 `[x]`: 새 디자인이 코드와 실제 기기에서 승인됨

두 상태를 혼용하지 않는다. TypeScript, ESLint, 번들 통과는 기능 검증이며 디자인 승인이 아니다.
