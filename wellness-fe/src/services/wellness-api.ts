import type { AutoHealthRecord, BaselineProfile, BodyMapHighlight, BodyMapPart, DailyCheckSubmission, HomeSummary } from '@/domain/wellness';

export interface WellnessApi {
  getAutoHealthRecord(): Promise<AutoHealthRecord>;
  getHomeSummary(): Promise<HomeSummary>;
  saveBaseline(profile: BaselineProfile): Promise<void>;
  saveDailyCheck(payload: DailyCheckSubmission): Promise<{ recordId: string }>;
}

const mockHomeSummary: HomeSummary = {
  dateLabel: '2025년 8월 10일',
  conditionLabel: '꽤 불편해요',
  evidence: '목이 4단계로 기록됐어요',
  tags: [
    { id: 'sleep', label: '수면 부족', tone: 'primary' },
    { id: 'activity', label: '활동 적음', tone: 'danger' },
    { id: 'neck', label: '목 4단계', tone: 'neutral' },
  ],
  recentRecords: [
    { id: '2025-08-10', date: '8월 10일', value: '수면 5시간 42분 · 목 4단계' },
    { id: '2025-08-09', date: '8월 9일', value: '수면 5시간 12분 · 목 4단계' },
    { id: '2025-08-08', date: '8월 8일', value: '수면 7시간 36분 · 불편 없음' },
  ],
  insight: {
    text: '최근보다 잠을 12분 덜 잤고, 목 불편이 2일 연속 기록됐어요',
    tags: [
      { id: 'sleep-delta', label: '수면 -3%', tone: 'primary' },
      { id: 'neck-days', label: '목 불편 2일째', tone: 'danger' },
      { id: 'steps', label: '걸음 수 3,400보', tone: 'neutral' },
    ],
  },
  routine: { title: '목 주변 가볍게 이완하기', description: '오늘의 상태를 바탕으로 추천해요', duration: '예상 2분', intensity: '강도 가볍게' },
  tips: ['1시간마다 자리에서 일어나기', '목표 취침 시간 11:30'],
  sleepTrend: { values: [5.8, 6.3, 5.9, 7.1, 6.0, 6.5, 6.8], averageLabel: '평균 6시간 22분', periodLabel: '최근 7일' },
  bodyHighlights: [{ part: 'shoulder', muscle: 'trapezius', color: '#EF7442', intensity: 2 }],
  bodyDetails: {
    neck: { title: '목이 평소보다 불편해 보여요', lines: [{ label: '수면 자세', value: '엎드려 자기' }, { label: '수면 시간', value: '5시간 12분' }, { label: '목 불편', value: '4단계' }] },
    shoulder: { title: '어깨가 평소보다 올라가 있어요', lines: [{ label: '자세', value: '어깨 올라감 2단계' }, { label: '활동', value: '4,230보' }, { label: '루틴', value: '실행하지 않음' }] },
    chest: { title: '가슴 기록', lines: [{ label: '불편 강도', value: '기록 없음' }, { label: '최근 기록', value: '없음' }] },
    upperArm: { title: '위팔 기록', lines: [{ label: '불편 강도', value: '1단계' }, { label: '느낌', value: '가벼운 당김' }] },
    forearm: { title: '아래팔 기록', lines: [{ label: '불편 강도', value: '기록 없음' }, { label: '최근 기록', value: '없음' }] },
    abdomen: { title: '복부 기록', lines: [{ label: '불편 강도', value: '기록 없음' }, { label: '최근 기록', value: '없음' }] },
    hip: { title: '골반 주변 기록', lines: [{ label: '불편 강도', value: '2단계' }, { label: '느낌', value: '뻐근함' }] },
    thigh: { title: '허벅지 기록', lines: [{ label: '활동', value: '4,230보' }, { label: '불편 강도', value: '1단계' }] },
    knee: { title: '무릎 기록', lines: [{ label: '불편 강도', value: '기록 없음' }, { label: '최근 기록', value: '없음' }] },
    calf: { title: '종아리 기록', lines: [{ label: '활동', value: '4,230보' }, { label: '불편 강도', value: '1단계' }] },
  },
};

let latestDailyCheck: DailyCheckSubmission | null = null;

const BODY_PART_HIGHLIGHTS: Readonly<Record<string, ReadonlyArray<Omit<BodyMapHighlight, 'color' | 'intensity'>>>> = {
  목: [{ part: 'neck', muscle: 'neck' }],
  어깨: [{ part: 'shoulder', muscle: 'trapezius' }, { part: 'shoulder', muscle: 'deltoids' }],
  허리: [{ part: 'hip', muscle: 'obliques' }],
  무릎: [{ part: 'knee', muscle: 'knees' }],
  손목: [{ part: 'forearm', muscle: 'forearm' }],
};

function highlightColor(intensity: number) {
  if (intensity >= 4) return '#E5484D';
  if (intensity >= 3) return '#EF7442';
  return '#F2A65A';
}

function highlightsFromCheck(check: DailyCheckSubmission): BodyMapHighlight[] {
  const intensity = Math.min(3, Math.max(1, Math.ceil((check.discomfort.intensity ?? 1) / 2))) as 1 | 2 | 3;
  const color = highlightColor(check.discomfort.intensity ?? 1);
  const unique = new Map<string, BodyMapHighlight>();
  check.discomfort.bodyParts.flatMap((part) => BODY_PART_HIGHLIGHTS[part] ?? []).forEach((highlight) => {
    unique.set(highlight.muscle, { ...highlight, color, intensity });
  });
  return [...unique.values()];
}

function detailsFromCheck(check: DailyCheckSubmission, highlights: readonly BodyMapHighlight[]): HomeSummary['bodyDetails'] {
  const details = { ...mockHomeSummary.bodyDetails };
  const intensity = check.discomfort.intensity ? `${check.discomfort.intensity}단계` : '기록 없음';
  const feeling = check.discomfort.feelings.length > 0 ? check.discomfort.feelings.join(', ') : '선택 안 함';
  const updated = new Set<BodyMapPart>();
  highlights.forEach(({ part }) => {
    if (updated.has(part)) return;
    updated.add(part);
    details[part] = {
      title: `${check.discomfort.bodyParts.join(', ')} 부위가 불편해요`,
      lines: [{ label: '불편 강도', value: intensity }, { label: '느낌', value: feeling }, { label: '수면 자세', value: check.sleep.posture ?? '기록 없음' }],
    };
  });
  return details;
}

class MockWellnessApi implements WellnessApi {
  async getAutoHealthRecord(): Promise<AutoHealthRecord> {
    return { sleepDuration: '5시간 42분', bedtime: '오전 1:18', steps: '4,230보', source: 'apple-health' };
  }

  async getHomeSummary(): Promise<HomeSummary> {
    if (!latestDailyCheck) return mockHomeSummary;
    const bodyHighlights = highlightsFromCheck(latestDailyCheck);
    return {
      ...mockHomeSummary,
      evidence: latestDailyCheck.discomfort.bodyParts.length > 0
        ? `${latestDailyCheck.discomfort.bodyParts.join(', ')}이(가) ${latestDailyCheck.discomfort.intensity ?? 0}단계로 기록됐어요`
        : '오늘 기록된 불편 부위가 없어요',
      bodyHighlights,
      bodyDetails: detailsFromCheck(latestDailyCheck, bodyHighlights),
    };
  }

  async saveBaseline(_profile: BaselineProfile): Promise<void> {
    await Promise.resolve();
  }

  async saveDailyCheck(payload: DailyCheckSubmission): Promise<{ recordId: string }> {
    latestDailyCheck = payload;
    return { recordId: 'mock-daily-check' };
  }
}

// 실제 API 연동 시 이 인스턴스만 HttpWellnessApi 구현으로 교체합니다.
export const wellnessApi: WellnessApi = new MockWellnessApi();
