/** `챗·기록 플로우 구현 프롬프트.md` A-4~A-7 의 시연 문구를 그대로 옮긴 것. */

export const INTRO_MESSAGES = [
  '안녕하세요, 기록에서 무엇을 찾아볼까요?',
  '수면·불편·활동 기록을 함께 읽어 정리해 드려요. 진단이나 처방은 하지 않아요.',
];

export const SUGGESTIONS = [
  '최근 수면 흐름을 정리해줘',
  '어깨가 불편했던 날을 찾아줘',
  '오늘 할 루틴을 추천해줘',
  '이번 주는 지난주와 어떻게 달라?',
];

export const FOLLOW_UPS = ['어깨 루틴 추천해줘', '지난주와 비교해줘'];

export const BOT_REPLY = '최근 14일 중 수면이 6시간보다 짧았던 날은 4일이었고, 그중 3일은 다음 날 어깨 불편이 함께 기록됐어요. 같은 기간 루틴을 한 날은 불편 강도가 평균 1단계 낮았습니다.';

export const BOT_REFERENCES = [
  { key: 'sleep', label: '8월 5–12일 수면', value: '평균 6시간 22분' },
  { key: 'ache', label: '불편 기록', value: '3일 · 어깨', danger: true },
];

export const BOT_REPLY_DELAY_MS = 1200;

/** A-10 — 진단·처방을 요구하는 질문은 데이터 인사이트 대신 안전 안내로 돌린다. */
export const MEDICAL_KEYWORDS = ['진단', '무슨 병', '병명', '처방', '무슨 약', '질병', '암이야', '병이야'];
export const SAFETY_REPLY = '정확한 진단은 병원 진료가 가장 안전해요. 저는 기록을 바탕으로 참고할 만한 정보만 드릴 수 있어요.';

export const GENERATION_CANCELLED_NOTE = '답변 생성을 멈췄어요';
