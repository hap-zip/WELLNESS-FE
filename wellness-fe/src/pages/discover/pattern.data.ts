import { getPatternDetail } from '@/services/backend/pattern';

export type PatternDetailView = {
  id: string;
  title: string;
  status: string;
  periodLabel: string;
  sourceMetric: string;
  targetMetric: string;
  relationDirection: string;
};

/**
 * 패턴 상세 — /api/patterns/{id} 응답을 그대로 옮긴다. 백엔드가 "해당한 날/예외였던 날"
 * 같은 근거 목록은 내려주지 않아서, 그 서술은 만들지 않고 이름·기간·사용한 지표만 보여준다.
 */
export async function loadPatternDetail(patternId: string): Promise<PatternDetailView | null> {
  const id = Number(patternId);
  if (!Number.isFinite(id)) return null;
  try {
    const pattern = await getPatternDetail(id);
    return {
      id: String(pattern.id ?? patternId),
      title: pattern.patternName ?? '패턴',
      status: pattern.status ?? '',
      periodLabel: pattern.analysisStartDate && pattern.analysisEndDate ? `${pattern.analysisStartDate} – ${pattern.analysisEndDate}` : '',
      sourceMetric: pattern.sourceMetric ?? '',
      targetMetric: pattern.targetMetric ?? '',
      relationDirection: pattern.relationDirection ?? '',
    };
  } catch {
    return null;
  }
}

export const PATTERN_ACTIONS = [
  { key: 'a', title: '목 이완 루틴 시작', meta: '오늘의 루틴 보기', icon: 'routine' as const, to: '/routine' as const },
  { key: 'b', title: '이 패턴에 대해 더 묻기', meta: '웰니스 챗에서 기록 기반으로 답해요', icon: 'health' as const, to: '/assistant' as const },
  { key: 'c', title: '전문가 공유용 요약 만들기', meta: '기간과 포함 항목을 골라 카드로', icon: 'skin' as const, to: '/reports/setup' as const },
];
