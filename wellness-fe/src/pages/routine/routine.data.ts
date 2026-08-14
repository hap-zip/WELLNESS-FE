/** `Momgirok v8.dc.html` → 루틴 4화면의 시연 데이터를 그대로 옮긴 것. */

export const ROUTINE_TITLE = '목 주변 가볍게 이완하기';
export const ROUTINE_REASON = '어깨 앞 불편이 3일째 이어지고 있고, 어제 수면이 6시간보다 짧았어요. 목과 어깨 주변을 짧게 풀어주는 동작을 골랐어요.';

export type RoutineMetaItem = { key: string; label: string; value: string; icon: 'routine' | 'flame' | 'ache' | 'health' };
export const ROUTINE_META: RoutineMetaItem[] = [
  { key: 'time', label: '예상 시간', value: '2분', icon: 'routine' },
  { key: 'intensity', label: '강도', value: '가볍게', icon: 'flame' },
  { key: 'area', label: '적용 부위', value: '목·어깨', icon: 'ache' },
  { key: 'gear', label: '준비물', value: '없음', icon: 'health' },
];

export type RoutineMove = {
  key: number; n: string; name: string; sec: string; desc: string; pose: 'neck' | 'shrug' | 'chest';
  /** ExerciseGymGifsDB(외부 무료 API)의 실제 스트레칭 GIF와 맞춘 slug. */
  stretchSlug: string;
};
export const ROUTINE_MOVES: RoutineMove[] = [
  { key: 1, n: '01', name: '목 뒤 늘이기', sec: '40초', desc: '턱을 가슴 쪽으로 천천히 당기고 어깨는 내린 채 유지해요.', pose: 'neck', stretchSlug: 'neck-side-stretch' },
  { key: 2, n: '02', name: '어깨 으쓱 이완', sec: '40초', desc: '숨을 들이마시며 어깨를 올리고, 내쉬며 툭 떨어뜨려요.', pose: 'shrug', stretchSlug: 'rear-deltoid-stretch' },
  { key: 3, n: '03', name: '가슴 열기', sec: '40초', desc: '양손을 뒤로 깍지 끼고 가슴을 앞으로 부드럽게 밀어요.', pose: 'chest', stretchSlug: 'chest-and-front-of-shoulder-stretch' },
];
export const MOVE_SECONDS = 40;
export const RING_CIRCUMFERENCE = 616;

export const DONE_ROWS = [
  { key: '실행 시간', k: '실행 시간', v: '1분 58초' },
  { key: '완료한 동작', k: '완료한 동작', v: '3 / 3' },
  { key: '적용 부위', k: '적용 부위', v: '목 · 어깨' },
];

export const AFTER_FEEL_LABELS = ['한결 편해요', '비슷해요', '더 불편해요'];

export type FeedbackTone = 'ok' | 'mid' | 'bad';
export const FB_OPTIONS: { id: number; label: string; icon: 'up' | 'flat' | 'down'; tone: FeedbackTone }[] = [
  { id: 0, label: '나아졌어요', icon: 'up', tone: 'ok' },
  { id: 1, label: '비슷해요', icon: 'flat', tone: 'mid' },
  { id: 2, label: '더 불편해요', icon: 'down', tone: 'bad' },
];
export function fbNoteFor(id: number) {
  return id === 0 ? '좋아요. 이 루틴을 어깨 불편이 있는 날에 더 자주 추천할게요.'
    : id === 1 ? '조금 더 지켜볼게요. 같은 루틴을 며칠 더 제안해요.'
    : '이 루틴 추천을 줄이고, 다른 방식의 동작을 먼저 제안할게요.';
}
