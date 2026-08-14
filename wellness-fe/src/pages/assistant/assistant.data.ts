/** `Momgirok v8.dc.html` → 챗 화면의 시연 데이터를 그대로 옮긴 것. */

export const SUGGESTIONS = [
  '최근 수면 흐름을 정리해줘',
  '어깨가 불편했던 날을 찾아줘',
  '오늘 할 루틴을 추천해줘',
  '이번 주는 지난주와 어떻게 달라?',
];

export const BOT_REPLY = '최근 14일 중 수면이 6시간보다 짧았던 날은 4일이었고, 그중 3일은 다음 날 어깨 불편이 함께 기록됐어요. 같은 기간 루틴을 한 날은 불편 강도가 평균 1단계 낮았습니다.';

export const BOT_REFERENCES = [
  { key: 'sleep', label: '8월 5–12일 수면', value: '평균 6시간 22분' },
  { key: 'ache', label: '불편 기록', value: '3일 · 어깨', danger: true },
];

export const BOT_REPLY_DELAY_MS = 900;
