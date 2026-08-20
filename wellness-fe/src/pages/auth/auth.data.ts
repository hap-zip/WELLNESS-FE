/** `Momgirok v8.dc.html` → 인증·시작 6화면의 시연 데이터를 그대로 옮긴 것. */

export function passwordRules(password: string) {
  return [
    { key: '8자 이상', label: '8자 이상', ok: password.length >= 8 },
    { key: '영문 포함', label: '영문 포함', ok: /[A-Za-z]/.test(password) },
    { key: '숫자 포함', label: '숫자 포함', ok: /\d/.test(password) },
  ];
}

export type AgreeItem = { id: string; k: string; req: '필수' | '선택' };
export const AGREE: AgreeItem[] = [
  { id: 'tos', k: '이용약관', req: '필수' },
  { id: 'privacy', k: '개인정보 처리방침', req: '필수' },
  { id: 'health', k: '건강정보 처리 동의', req: '필수' },
  { id: 'marketing', k: '마케팅 정보 수신', req: '선택' },
];

export const HC_ITEMS = [
  { key: '수면 분석', k: '수면 분석', why: '어젯밤 잠든 시간과 깬 시간을 자동으로 채워요', icon: 'sleep' as const },
  { key: '걸음 수', k: '걸음 수', why: '활동량이 불편과 어떻게 겹치는지 볼 때 써요', icon: 'steps' as const },
  { key: '활동 에너지', k: '활동 에너지', why: '많이 움직인 날을 구분하는 데 써요', icon: 'flame' as const },
];

// title 원본의 `\n` 은 일반 텍스트 보간이라 브라우저가 공백으로 접는다 —
// RN Text 에서는 강제 개행이 되므로 여기서 공백으로 바꿔 자연 줄바꿈을 맞춘다.
export const ONBOARD_PAGES = [
  { key: 'record', eyebrow: '하루 기록', title: '직접 남긴 기록과\n건강 데이터를 한곳에', desc: '불편 부위와 컨디션은 가볍게 체크하고, 수면·걸음·활동량은 자동으로 채워요.' },
  { key: 'connection', eyebrow: '커넥션', title: '내 평소와 비교해\n반복되는 연결을 찾아요', desc: '같은 시간축에 기록을 겹쳐 보고, 함께 나타나는 생활과 몸의 흐름을 근거와 함께 확인해요.' },
  { key: 'routine', eyebrow: '행동과 피드백', title: '오늘 할 행동을 찾고\n실제 변화를 확인해요', desc: '1~5분 맞춤 루틴을 실행하고 다음 날 효과를 기록해, 추천이 나에게 더 잘 맞아져요.' },
  { key: 'chat', eyebrow: '웰니스 챗', title: '인터넷보다\n내 기록을 먼저 살펴봐요', desc: '내 기록 기반 답변과 공식 의약품 정보를 확인하고, 필요하면 전문가용 요약 카드를 만들어요.' },
];
