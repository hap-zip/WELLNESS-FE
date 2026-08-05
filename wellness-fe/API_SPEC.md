# 몸기록 서비스 API 목록

## 공통

- Base URL: `/api/v1`
- 사용자 인증 API는 Bearer Access Token을 사용한다.
- 요청·응답 JSON 구조는 백엔드 구현 단계에서 확정한다.
- 현재 테이블: `users`, `daily_checks`, `expert_cards`, `wellness_chats`, `persistent_signals`

## 1. 인증

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P0 | POST | `/auth/signup` | 이메일 회원가입 | `users` |
| P0 | POST | `/auth/login` | 이메일 로그인 | `users` |
| P0 | POST | `/auth/refresh` | 액세스 토큰 갱신 | 토큰 테이블 추가 필요 |
| P0 | POST | `/auth/logout` | 로그아웃 및 토큰 만료 | 토큰 테이블 추가 필요 |
| P1 | POST | `/auth/password/reset-request` | 비밀번호 재설정 요청 | 인증 코드 테이블 추가 필요 |
| P1 | POST | `/auth/password/reset` | 비밀번호 재설정 | `users`, 인증 코드 테이블 추가 필요 |
| P1 | POST | `/auth/email/verify-request` | 이메일 인증 코드 발송 | 인증 코드 테이블 추가 필요 |
| P1 | POST | `/auth/email/verify` | 이메일 인증 완료 | `users`, 인증 코드 테이블 추가 필요 |

## 2. 사용자·계정

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P0 | GET | `/users/me` | 내 프로필과 계정 상태 조회 | `users` |
| P0 | PATCH | `/users/me` | 닉네임·생년월일·성별 수정 | `users` |
| P1 | PATCH | `/users/me/password` | 비밀번호 변경 | `users` |
| P0 | DELETE | `/users/me` | 회원 탈퇴 | 사용자 관련 전체 테이블 |
| P1 | POST | `/users/me/logout-all` | 전체 기기 로그아웃 | 토큰 테이블 추가 필요 |

## 3. 약관·동의

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P0 | GET | `/users/me/consents` | 이용약관·개인정보·건강정보 동의 상태 조회 | `users` |
| P0 | PATCH | `/users/me/consents` | 선택 동의 변경 및 동의 철회 | `users` 또는 `user_consents` 추가 권장 |
| P1 | GET | `/legal-documents` | 현재 적용 중인 약관 목록 조회 | 약관 테이블 추가 필요 |
| P1 | GET | `/legal-documents/{documentId}` | 약관·개인정보처리방침 상세 조회 | 약관 테이블 추가 필요 |

## 4. 기본 상태·개인 기준선

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P0 | GET | `/users/me/baseline-profile` | 온보딩 기본 상태 설정 조회 | 기준 상태 테이블 추가 필요 |
| P0 | PUT | `/users/me/baseline-profile` | 취침·기상·활동·주요 불편 부위 저장 | 기준 상태 테이블 추가 필요 |
| P1 | GET | `/users/me/personal-baseline` | 기록으로 계산된 개인 기준선 조회 | `daily_checks` 집계 또는 기준선 테이블 추가 필요 |

## 5. 웨어러블·건강 데이터 연동

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P0 | GET | `/health-connections` | 연결된 건강 데이터 제공자와 상태 조회 | `users` 또는 연결 테이블 추가 권장 |
| P0 | POST | `/health-connections` | Apple Health·Health Connect 연결 정보 저장 | `users` 또는 연결 테이블 추가 권장 |
| P0 | PATCH | `/health-connections/{connectionId}` | 수면·걸음·심박 읽기 항목 변경 | 연결 테이블 추가 필요 |
| P0 | DELETE | `/health-connections/{connectionId}` | 건강 데이터 연결 해제 | 연결 테이블 추가 필요 |
| P0 | POST | `/health-data/sync` | 기기에서 수집한 건강 데이터 서버 동기화 | 건강 데이터 테이블 추가 필요 |
| P0 | GET | `/health-data/daily/{date}` | 특정 날짜 자동 수집 수면·걸음 데이터 조회 | 건강 데이터 테이블 또는 `daily_checks` |
| P1 | GET | `/health-data/sync-status` | 마지막 동기화 시간과 오류 상태 조회 | 연결 테이블 추가 필요 |

## 6. 데일리 체크·기록

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P0 | POST | `/daily-checks` | 데일리 체크 최종 저장 | `daily_checks` |
| P0 | GET | `/daily-checks/{date}` | 특정 날짜 기록 상세 조회 | `daily_checks` |
| P0 | PATCH | `/daily-checks/{date}` | 특정 날짜 기록 수정 | `daily_checks` |
| P0 | DELETE | `/daily-checks/{date}` | 특정 날짜 기록 삭제 | `daily_checks` |
| P0 | GET | `/daily-checks` | 기간·연도·월 조건으로 기록 목록 조회 | `daily_checks` |
| P1 | PUT | `/daily-checks/{date}/draft` | 작성 중인 기록 임시 저장 | 초안 테이블 또는 JSON 컬럼 추가 필요 |
| P1 | GET | `/daily-checks/{date}/draft` | 작성 중인 기록 복구 | 초안 테이블 또는 JSON 컬럼 추가 필요 |
| P1 | DELETE | `/daily-checks/{date}/draft` | 기록 초안 삭제 | 초안 테이블 또는 JSON 컬럼 추가 필요 |

## 7. 불편 부위

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P0 | GET | `/daily-checks/{date}/pains` | 날짜별 불편 부위와 부위별 강도 조회 | 불편 부위 테이블 추가 권장 |
| P0 | PUT | `/daily-checks/{date}/pains` | 여러 불편 부위·강도·느낌 저장 | 불편 부위 테이블 추가 권장 |
| P1 | GET | `/pain-areas/recent` | 최근 자주 기록한 부위 조회 | `daily_checks` 또는 불편 부위 테이블 |

## 8. 피부 상태·이미지

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P0 | POST | `/skin-images/upload-url` | 피부 이미지 업로드 URL 발급 | 이미지 테이블 추가 필요 |
| P0 | POST | `/skin-images` | 업로드된 피부 이미지를 기록과 연결 | 이미지 테이블 추가 필요 |
| P0 | GET | `/skin-images/{imageId}` | 피부 이미지 메타데이터와 조회 URL 발급 | 이미지 테이블 추가 필요 |
| P0 | DELETE | `/skin-images/{imageId}` | 피부 이미지 한 장 삭제 | 이미지 테이블 추가 필요 |
| P1 | GET | `/daily-checks/{date}/skin-images` | 특정 날짜 피부 이미지 목록 조회 | 이미지 테이블 추가 필요 |
| P1 | DELETE | `/users/me/skin-images` | 사용자의 전체 피부 이미지 삭제 | 이미지 테이블 추가 필요 |

## 9. 홈

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P0 | GET | `/home` | 오늘 상태·바디맵·기록 여부·루틴·패턴·지속 신호 통합 조회 | 서비스 데이터 집계 |
| P1 | GET | `/home/body-status` | 부위별 최근 상태와 바디맵 표시 데이터 조회 | `daily_checks`, 불편 부위 테이블 |
| P1 | GET | `/home/recent-pattern` | 홈에 노출할 대표 패턴 한 건 조회 | `daily_checks` 집계 또는 패턴 테이블 |

## 10. 기록 캘린더·날짜 상세

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P0 | GET | `/records/calendar` | 월별 날짜·기록 여부·상태 요약 조회 | `daily_checks` |
| P0 | GET | `/records/{date}` | 수면·활동·불편·피부·루틴·피드백 상세 조회 | 관련 기록 전체 집계 |

## 11. 커넥션 뷰·패턴

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P1 | GET | `/connections` | 선택 기간의 기준선·차트·패턴 목록 조회 | `daily_checks` 집계 |
| P1 | GET | `/connections/daily/{date}` | 그래프에서 선택한 날짜의 기록 요약 조회 | `daily_checks` |
| P1 | GET | `/patterns` | 사용자의 발견 패턴 목록 조회 | 실시간 집계 또는 패턴 테이블 추가 필요 |
| P1 | GET | `/patterns/{patternId}` | 패턴 근거·신뢰 상태·관련 기록 상세 조회 | 실시간 집계 또는 패턴 테이블 추가 필요 |

## 12. 오늘의 루틴

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P0 | GET | `/routines/today` | 오늘 추천 루틴과 추천 이유 조회 | 루틴·추천 테이블 추가 필요 |
| P0 | GET | `/routines/{routineId}` | 루틴 단계·시간·주의사항 상세 조회 | 루틴·단계 테이블 추가 필요 |
| P0 | POST | `/routine-completions` | 루틴 실행 결과 저장 | 완료 테이블 추가 필요 |
| P1 | GET | `/routine-completions` | 기간별 루틴 완료 내역 조회 | 완료 테이블 추가 필요 |
| P1 | GET | `/routine-completions/{completionId}` | 루틴 완료 상세 조회 | 완료 테이블 추가 필요 |

## 13. 루틴·증상 효과 피드백

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P0 | POST | `/routine-feedbacks` | 즉시 또는 다음 날 루틴 효과 저장 | 피드백 테이블 추가 필요 |
| P1 | GET | `/routine-feedbacks/pending` | 아직 응답하지 않은 효과 피드백 조회 | 완료·피드백 테이블 추가 필요 |
| P1 | GET | `/routine-feedbacks/summary` | 최근 루틴별 효과 요약 조회 | 피드백 테이블 추가 필요 |

## 14. 지속 신호

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P1 | GET | `/persistent-signals` | 지속·악화·무개선 신호 목록 조회 | `persistent_signals` |
| P1 | GET | `/persistent-signals/current` | 현재 노출할 미해결 신호 조회 | `persistent_signals` |
| P1 | GET | `/persistent-signals/{signalId}` | 지속 신호 상세 조회 | `persistent_signals` |
| P1 | PATCH | `/persistent-signals/{signalId}/acknowledge` | 사용자가 신호를 확인한 상태로 변경 | `persistent_signals` |

지속 신호 생성은 프론트 호출 API가 아니라 `daily_checks`와 루틴 피드백 저장 후 백엔드에서 처리한다.

## 15. 전문가용 상태 요약 카드

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P1 | POST | `/expert-cards` | 선택 기간의 상태 요약 카드 생성 | `expert_cards`, 관련 기록 집계 |
| P1 | GET | `/expert-cards` | 생성한 상태 요약 카드 목록 조회 | `expert_cards` |
| P1 | GET | `/expert-cards/{cardId}` | 상태 요약 카드 상세 조회 | `expert_cards` |
| P1 | DELETE | `/expert-cards/{cardId}` | 상태 요약 카드 삭제 | `expert_cards` |
| P1 | POST | `/expert-cards/{cardId}/share` | 공유 토큰과 만료 시각 생성 | `expert_cards` |
| P1 | DELETE | `/expert-cards/{cardId}/share` | 공유 토큰 폐기 | `expert_cards` |
| P1 | GET | `/shared/expert-cards/{shareToken}` | 공유 링크로 카드 조회 | `expert_cards` |
| P2 | POST | `/expert-cards/{cardId}/exports` | 카드 이미지·PDF 파일 생성 | 내보내기 테이블 또는 파일 테이블 추가 필요 |
| P2 | GET | `/expert-card-exports/{exportId}` | 이미지·PDF 생성 상태와 다운로드 URL 조회 | 내보내기 테이블 또는 파일 테이블 추가 필요 |

텍스트 복사는 카드 상세 응답을 이용해 프론트에서 처리할 수 있으므로 별도 API가 필요하지 않다.

## 16. 웰니스 챗

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P1 | POST | `/wellness-chats` | 사용자 질문 전송 및 기록 기반 답변 생성 | `wellness_chats`, `daily_checks` |
| P1 | GET | `/wellness-chats` | 챗 질문·답변 내역 조회 | `wellness_chats` |
| P1 | GET | `/wellness-chats/{chatId}` | 챗 질문·답변 상세 조회 | `wellness_chats` |
| P1 | DELETE | `/wellness-chats/{chatId}` | 챗 한 건 삭제 | `wellness_chats` |
| P1 | DELETE | `/wellness-chats` | 전체 챗 내역 삭제 | `wellness_chats` |

현재 `wellness_chats`는 질문·답변 한 쌍 단위다. 대화방이 필요하면 대화방·메시지 테이블 분리가 필요하다.

## 17. 의약품 정보·약 포장 이미지

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P1 | GET | `/medicines` | 제품명·성분명으로 의약품 검색 | 식약처 API 또는 의약품 캐시 테이블 필요 |
| P1 | GET | `/medicines/{medicineId}` | 성분·효능·주의사항·공식 출처 상세 조회 | 식약처 API 또는 의약품 캐시 테이블 필요 |
| P1 | POST | `/medicine-images/upload-url` | 약 포장 이미지 업로드 URL 발급 | 이미지 테이블 추가 필요 |
| P1 | POST | `/medicines/image-search` | 약 포장 이미지로 의약품 후보 검색 | 이미지·검색 결과 테이블 추가 필요 |
| P2 | GET | `/medicines/recent-searches` | 최근 검색한 의약품 목록 조회 | 검색 기록 테이블 추가 필요 |
| P2 | DELETE | `/medicines/recent-searches` | 최근 의약품 검색 기록 삭제 | 검색 기록 테이블 추가 필요 |

## 18. 푸시 알림 설정·기기 토큰

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P0 | GET | `/notification-settings` | 전체 푸시·데일리 체크·루틴·효과·지속 신호 알림 설정 조회 | 알림 설정 테이블 추가 필요 |
| P0 | PATCH | `/notification-settings` | 알림 종류와 알림 시간 변경 | 알림 설정 테이블 추가 필요 |
| P0 | POST | `/push-tokens` | Expo Push Token·APNs·FCM 기기 토큰 등록 | 푸시 토큰 테이블 추가 필요 |
| P0 | DELETE | `/push-tokens/{pushTokenId}` | 로그아웃·기기 변경 시 토큰 삭제 | 푸시 토큰 테이블 추가 필요 |
| P1 | POST | `/push-tokens/{pushTokenId}/refresh` | 만료·변경된 기기 토큰 갱신 | 푸시 토큰 테이블 추가 필요 |

## 19. 알림함

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P1 | GET | `/notifications` | 앱 내 알림 목록 조회 | 알림 테이블 추가 필요 |
| P1 | GET | `/notifications/unread-count` | 읽지 않은 알림 수 조회 | 알림 테이블 추가 필요 |
| P1 | PATCH | `/notifications/{notificationId}/read` | 알림 한 건 읽음 처리 | 알림 테이블 추가 필요 |
| P1 | PATCH | `/notifications/read-all` | 전체 알림 읽음 처리 | 알림 테이블 추가 필요 |
| P2 | DELETE | `/notifications/{notificationId}` | 알림 한 건 삭제 | 알림 테이블 추가 필요 |

푸시 발송 자체는 프론트에서 호출하지 않고 백엔드가 저장된 설정과 토큰을 이용해 처리한다.

## 20. 데이터 관리

| 우선순위 | Method | Endpoint | 기능 | 관련 테이블 |
|---|---|---|---|---|
| P1 | POST | `/users/me/data-export` | 내 전체 데이터 다운로드 파일 생성 요청 | 내보내기 테이블·파일 테이블 추가 필요 |
| P1 | GET | `/users/me/data-export/{exportId}` | 데이터 파일 생성 상태와 다운로드 URL 조회 | 내보내기 테이블·파일 테이블 추가 필요 |
| P0 | DELETE | `/users/me/data` | 전체 건강·기록 데이터 삭제 | 사용자 관련 전체 테이블 |
| P0 | DELETE | `/users/me/data?startDate={date}&endDate={date}` | 특정 기간 기록 삭제 | `daily_checks` 및 관련 테이블 |
| P0 | DELETE | `/users/me/skin-images` | 전체 피부 이미지 삭제 | 이미지 테이블 추가 필요 |
| P1 | DELETE | `/users/me/wellness-chats` | 전체 챗 데이터 삭제 | `wellness_chats` |