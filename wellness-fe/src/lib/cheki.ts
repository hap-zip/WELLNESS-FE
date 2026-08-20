/**
 * "체키" — 몸기록 마스코트. `assets/character/cheki_character_usage_guide.md`
 * 가이드의 상태별 매핑을 그대로 코드로 옮긴 것. 장식용이 아니라 상태 전달용
 * 보조 요소로만 쓴다 — 데이터 카드마다 붙이지 않고, 화면당 한 번만 노출한다.
 *
 * 원본 파일명은 한글이었는데, Metro 에셋 서버가 Windows 에서 비-ASCII 파일명을
 * `scandir` 하지 못해 `ENOENT` 로 죽는 걸 확인해서 영문 kebab-case 로 옮겼다
 * (가이드 문서 7장이 이미 권장했던 이름이기도 하다).
 */
export const CHEKI = {
  /** 기본형 — 기준 포즈, 안내 문서 표지 등 */
  base: require('../../assets/character/cheki-base.png'),
  /** 첫 진입/온보딩/빈 상태 — 손인사 */
  welcome: require('../../assets/character/cheki-welcome.png'),
  /** 수면 기록·휴식 안내 — 잠든 모습 */
  sleep: require('../../assets/character/cheki-sleep.png'),
  /** 불편 부위 체크 — 어깨를 짚고 아파하는 모습 */
  painCheck: require('../../assets/character/cheki-pain-check.png'),
  /** 웰니스 챗·설명·코칭 — 클립보드 들고 안내 */
  chat: require('../../assets/character/cheki-chat.png'),
  /** 기록 작성·직접 입력 — 메모하는 모습 */
  recording: require('../../assets/character/cheki-recording.png'),
  /** 패턴 분석·커넥션·인사이트 — 돋보기로 살펴보는 모습 */
  insight: require('../../assets/character/cheki-insight.png'),
} as const;

export type ChekiPose = keyof typeof CHEKI;
