/** 챗봇 인사말·추천 질문 문구. 답변 자체는 실제 /api/chat 응답을 쓴다. */

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

export const GENERATION_CANCELLED_NOTE = '답변 생성을 멈췄어요';
