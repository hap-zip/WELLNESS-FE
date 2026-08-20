/** 루틴 완료 후 효과 피드백 선택지 — 고정된 3개 선택지 UI 문구다. 루틴 자체(제목·동작·소요
 * 시간)는 이제 실제 `/api/routines/today` 응답(RoutineSessionContext)을 쓴다. */

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
