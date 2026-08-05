import type { AssistantMessage, AssistantReply, AutoHealthRecord, BaselineProfile, BodyMapHighlight, BodyMapPart, DailyCheckSubmission, DataConsentSettings, DiscoverSummary, HealthConnectionSettings, HealthReport, HomeSummary, NotificationSettings, PatternDetail, RecordDetail, RecordsMonth, ReportOptions, RoutineCompletion, RoutineFeedback, RoutinePlan, SignalSummary, UserProfileSummary, WellnessRecordSummary } from '@/domain/wellness';

export interface WellnessApi {
  getAutoHealthRecord(): Promise<AutoHealthRecord>;
  getHomeSummary(): Promise<HomeSummary>;
  getDiscoverSummary(endDate: string): Promise<DiscoverSummary>;
  getPatternDetail(patternId: string, endDate: string): Promise<PatternDetail | null>;
  getRecordDetail(date: string): Promise<RecordDetail | null>;
  getRecordsMonth(year: number, month: number): Promise<RecordsMonth>;
  getTodayRoutine(): Promise<RoutinePlan>;
  saveRoutineCompletion(routineId: string, completedSeconds: number, completedSteps: number): Promise<RoutineCompletion>;
  saveRoutineFeedback(feedback: RoutineFeedback): Promise<{ feedbackId: string; shouldShowSignal: boolean }>;
  getSignalSummary(): Promise<SignalSummary>;
  createHealthReport(options: ReportOptions): Promise<HealthReport>;
  askRecordAssistant(message: string, history: AssistantMessage[]): Promise<AssistantReply>;
  getUserProfile(): Promise<UserProfileSummary>;
  getHealthConnection(): Promise<HealthConnectionSettings>;
  saveHealthConnection(settings: HealthConnectionSettings): Promise<void>;
  getNotificationSettings(): Promise<NotificationSettings>;
  saveNotificationSettings(settings: NotificationSettings): Promise<void>;
  getDataConsentSettings(): Promise<DataConsentSettings>;
  saveDataConsentSettings(settings: DataConsentSettings): Promise<void>;
  deleteAllUserData(): Promise<void>;
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
let latestRoutineCompletion: RoutineCompletion | null = null;
let latestRoutineFeedback: RoutineFeedback | null = null;
let healthConnection: HealthConnectionSettings = { provider: 'apple-health', connected: false, lastSyncedLabel: null, permissions: { sleep: true, steps: true, heartRate: false } };
let notificationSettings: NotificationSettings = { enabled: true, dailyCheck: true, routine: true, weeklyReport: false, reminderTime: '21:30' };
let dataConsentSettings: DataConsentSettings = { healthData: true, personalizedInsights: true, marketing: false, consentedAtLabel: '2026년 8월 1일', retentionLabel: '회원 탈퇴 시까지' };
let userDataDeleted = false;

function localDateId(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function relativeDate(daysAgo: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function addDays(dateId: string, delta: number) {
  const [year, month, day] = dateId.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  date.setDate(date.getDate() + delta);
  return localDateId(date);
}

function shortDate(dateId: string) {
  const [, month, day] = dateId.split('-').map(Number);
  return `${month}/${day}`;
}

const CONDITION_LABELS: Readonly<Record<string, string>> = {
  great: '매우 좋아요',
  good: '좋아요',
  okay: '보통이에요',
  bad: '별로예요',
  awful: '많이 안 좋아요',
};

const mockRecords: WellnessRecordSummary[] = [
  { id: 'mock-today', date: localDateId(relativeDate(0)), condition: '꽤 불편해요', conditionTone: 'danger', sleepDuration: '5시간 42분', steps: '4,230보', bodyParts: ['목'], intensity: 4, memo: '오후부터 목이 뻐근했어요.' },
  { id: 'mock-day-1', date: localDateId(relativeDate(1)), condition: '조금 피곤해요', conditionTone: 'caution', sleepDuration: '6시간 10분', steps: '6,840보', bodyParts: ['어깨'], intensity: 2, memo: '' },
  { id: 'mock-day-3', date: localDateId(relativeDate(3)), condition: '괜찮아요', conditionTone: 'good', sleepDuration: '7시간 21분', steps: '8,120보', bodyParts: [], intensity: null, memo: '가벼운 산책을 했어요.' },
  { id: 'mock-day-6', date: localDateId(relativeDate(6)), condition: '조금 불편해요', conditionTone: 'caution', sleepDuration: '6시간 35분', steps: '5,510보', bodyParts: ['허리'], intensity: 3, memo: '' },
];

function latestRecordFor(date: string): WellnessRecordSummary | null {
  if (userDataDeleted) return null;
  if (latestDailyCheck && date === localDateId(new Date())) {
    const intensity = latestDailyCheck.discomfort.intensity ?? 0;
    return {
      id: 'latest-daily-check',
      date,
      condition: latestDailyCheck.condition ? CONDITION_LABELS[latestDailyCheck.condition] ?? latestDailyCheck.condition : '기록 완료',
      conditionTone: intensity >= 4 ? 'danger' : intensity >= 2 ? 'caution' : 'good',
      sleepDuration: latestDailyCheck.autoRecords.sleepDuration || '기록 없음',
      steps: latestDailyCheck.autoRecords.steps || '기록 없음',
      bodyParts: latestDailyCheck.discomfort.bodyParts,
      intensity: latestDailyCheck.discomfort.intensity,
      memo: latestDailyCheck.activitySkin.memo,
    };
  }
  return mockRecords.find((record) => record.date === date) ?? null;
}

const DISCOVER_PATTERNS = [
  { id: 'sleep-neck', title: '수면이 짧은 날 목 불편이 높아요', summary: '6시간 미만 수면 다음 날 목 불편 기록이 반복됐어요.', metric: '불편 +38%', tone: 'danger' as const },
  { id: 'steps-condition', title: '걸음 수와 컨디션이 함께 움직여요', summary: '6천 보 이상 걸은 날 컨디션 점수가 더 높았어요.', metric: '컨디션 +21%', tone: 'primary' as const },
  { id: 'bedtime-sleep', title: '늦은 취침이 수면 만족도에 영향을 줘요', summary: '자정 이후 잠든 날 수면 만족도가 낮게 기록됐어요.', metric: '만족도 -17%', tone: 'caution' as const },
];

const TODAY_ROUTINE: RoutinePlan = {
  id: 'neck-release-01',
  title: '목 주변 가볍게 이완하기',
  description: '호흡을 이어가며 목과 어깨의 긴장을 천천히 풀어요.',
  reason: '최근 목 불편과 짧은 수면 기록을 바탕으로 추천했어요.',
  intensity: '가볍게',
  targetArea: '목 · 어깨',
  totalSeconds: 120,
  caution: '통증이나 어지러움이 느껴지면 즉시 멈추고 편한 자세로 돌아오세요.',
  steps: [
    { id: 'breath', title: '자세 잡고 호흡하기', instruction: '등을 편하게 세우고 어깨 힘을 뺀 채 천천히 숨을 쉬어요.', durationSeconds: 30, side: 'center' },
    { id: 'left', title: '오른쪽 목 늘리기', instruction: '오른손을 머리 위에 가볍게 올리고 오른쪽으로 기울여요.', durationSeconds: 30, side: 'right' },
    { id: 'right', title: '왼쪽 목 늘리기', instruction: '왼손을 머리 위에 가볍게 올리고 왼쪽으로 기울여요.', durationSeconds: 30, side: 'left' },
    { id: 'roll', title: '어깨 천천히 돌리기', instruction: '양쪽 어깨를 귀 쪽으로 올렸다가 뒤로 크게 원을 그려요.', durationSeconds: 30, side: 'center' },
  ],
};

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
  async getUserProfile(): Promise<UserProfileSummary> { return { name: '김몸기록', email: 'wellness@example.com', joinedLabel: '2026년 8월부터', recordDays: userDataDeleted ? 0 : mockRecords.length + (latestDailyCheck ? 1 : 0), routineCount: userDataDeleted ? 0 : latestRoutineCompletion ? 3 : 2, healthConnected: healthConnection.connected, notificationEnabled: notificationSettings.enabled }; }
  async getHealthConnection(): Promise<HealthConnectionSettings> { return { ...healthConnection, permissions: { ...healthConnection.permissions } }; }
  async saveHealthConnection(settings: HealthConnectionSettings): Promise<void> { healthConnection = { ...settings, lastSyncedLabel: settings.connected ? '방금 동기화' : null, permissions: { ...settings.permissions } }; }
  async getNotificationSettings(): Promise<NotificationSettings> { return { ...notificationSettings }; }
  async saveNotificationSettings(settings: NotificationSettings): Promise<void> { notificationSettings = { ...settings }; }
  async getDataConsentSettings(): Promise<DataConsentSettings> { return { ...dataConsentSettings }; }
  async saveDataConsentSettings(settings: DataConsentSettings): Promise<void> { dataConsentSettings = { ...settings }; }
  async deleteAllUserData(): Promise<void> { latestDailyCheck = null; latestRoutineCompletion = null; latestRoutineFeedback = null; healthConnection = { ...healthConnection, connected: false, lastSyncedLabel: null }; userDataDeleted = true; }

  async askRecordAssistant(message: string, _history: AssistantMessage[]): Promise<AssistantReply> {
    await new Promise((resolve) => setTimeout(resolve, 550));
    const normalized = message.replace(/\s/g, '');
    const base = { id: `assistant-${Date.now()}`, role: 'assistant' as const, createdAt: new Date().toISOString() };
    if (/진단|병원|디스크|질병|약|치료/.test(normalized)) return { message: { ...base, text: '기록만으로 질환을 진단할 수는 없어요. 불편이 계속되거나 심해진다면 의료 전문가와 상담해 주세요. 갑작스러운 마비나 매우 심한 통증처럼 긴급한 증상이 있다면 즉시 도움을 요청하세요.' }, suggestions: ['지속된 기록 보여줘', '기록 요약 만들기'], action: { label: '지속 신호 확인', route: '/safety/signal' } };
    if (/수면|잠|취침/.test(normalized)) return { message: { ...base, text: '최근 7일 평균 수면은 6시간 22분이에요. 수면이 6시간보다 짧았던 다음 날 목 불편이 높게 기록되는 흐름이 있었어요.' }, suggestions: ['목 불편 기록도 보여줘', '기록 요약 만들기'], action: { label: '전체 기록 보기', route: '/(tabs)/records' } };
    if (/루틴|운동|스트레칭/.test(normalized)) return { message: { ...base, text: latestRoutineCompletion ? '오늘 목·어깨 이완 루틴을 완료했어요. 무리하지 않는 범위에서 천천히 이어가는 것이 좋아요.' : '오늘은 목과 어깨를 가볍게 이완하는 2분 루틴이 추천되어 있어요.' }, suggestions: ['왜 이 루틴을 추천했어?', '오늘 기록 도와줘'], action: { label: latestRoutineCompletion ? '루틴 다시 보기' : '루틴 시작하기', route: '/routine' } };
    if (/목|어깨|불편|아파/.test(normalized)) return { message: { ...base, text: '최근에는 목 불편이 가장 자주 기록됐고, 강도는 평균 4단계였어요. 같은 부위가 반복되고 있으니 무리한 동작은 쉬어 주세요.' }, suggestions: ['수면과 관련 있어?', '지속된 기록 보여줘'], action: { label: '기록 캘린더 보기', route: '/(tabs)/records' } };
    if (/요약|공유|리포트/.test(normalized)) return { message: { ...base, text: '기간과 포함할 항목을 선택하면 수면·활동·불편·루틴 기록을 한 장으로 정리할 수 있어요.' }, suggestions: ['최근 수면 알려줘', '목 불편 기록 알려줘'], action: { label: '기록 요약 만들기', route: '/reports/setup' } };
    if (/기록|체크/.test(normalized)) return { message: { ...base, text: latestDailyCheck ? '오늘 상태 기록이 저장되어 있어요. 목·어깨 불편, 수면, 활동 기록을 캘린더에서 확인할 수 있어요.' : '아직 오늘 상태 기록이 없어요. 불편 부위와 수면, 활동 상태를 순서대로 기록할 수 있어요.' }, suggestions: ['최근 수면 알려줘', '오늘 루틴 추천해줘'], action: { label: latestDailyCheck ? '오늘 기록 보기' : '상태 기록하기', route: latestDailyCheck ? '/(tabs)/records' : '/check/auto' } };
    return { message: { ...base, text: '저는 몸 상태를 진단하는 대신, 남긴 기록을 찾아보고 정리하는 일을 도와드려요. 수면, 불편 부위, 활동, 루틴 중 궁금한 내용을 물어보세요.' }, suggestions: ['최근 수면 알려줘', '목 불편 기록 알려줘', '오늘 루틴 추천해줘'] };
  }

  async getAutoHealthRecord(): Promise<AutoHealthRecord> {
    return { sleepDuration: '5시간 42분', bedtime: '오전 1:18', steps: '4,230보', source: 'apple-health' };
  }

  async getHomeSummary(): Promise<HomeSummary> {
    const routine = latestRoutineCompletion?.routineId === TODAY_ROUTINE.id
      ? { ...mockHomeSummary.routine, description: '오늘 루틴을 완료했어요', duration: '완료' }
      : mockHomeSummary.routine;
    if (!latestDailyCheck) return { ...mockHomeSummary, routine };
    const bodyHighlights = highlightsFromCheck(latestDailyCheck);
    return {
      ...mockHomeSummary,
      evidence: latestDailyCheck.discomfort.bodyParts.length > 0
        ? `${latestDailyCheck.discomfort.bodyParts.join(', ')}이(가) ${latestDailyCheck.discomfort.intensity ?? 0}단계로 기록됐어요`
        : '오늘 기록된 불편 부위가 없어요',
      bodyHighlights,
      bodyDetails: detailsFromCheck(latestDailyCheck, bodyHighlights),
      routine,
    };
  }

  async getTodayRoutine(): Promise<RoutinePlan> {
    return TODAY_ROUTINE;
  }

  async saveRoutineCompletion(routineId: string, completedSeconds: number, completedSteps: number): Promise<RoutineCompletion> {
    latestRoutineCompletion = { completionId: `routine-${Date.now()}`, routineId, completedAt: new Date().toISOString(), completedSeconds, completedSteps };
    return latestRoutineCompletion;
  }

  async saveRoutineFeedback(feedback: RoutineFeedback): Promise<{ feedbackId: string; shouldShowSignal: boolean }> {
    latestRoutineFeedback = feedback;
    return { feedbackId: `feedback-${Date.now()}`, shouldShowSignal: feedback.effect === 'worse' || feedback.discomfortLevel >= 4 };
  }

  async getSignalSummary(): Promise<SignalSummary> {
    const level = latestRoutineFeedback?.discomfortLevel ?? 4;
    return { title: '목 불편이 계속 기록되고 있어요', description: `최근 기록과 루틴 피드백에서 ${level}단계 안팎의 불편이 반복됐어요.`, durationLabel: '최근 7일 중 4일', occurrences: 4, evidence: ['같은 부위의 불편이 반복됨', '휴식·루틴 후에도 불편 유지', '수면이 짧은 날 강도가 높아짐'], guidance: ['무리한 동작은 잠시 쉬어 주세요.', '증상이 지속되거나 심해지면 의료 전문가와 상담하세요.', '갑작스러운 마비·심한 통증 등 응급 증상이 있으면 즉시 도움을 요청하세요.'] };
  }

  async createHealthReport(options: ReportOptions): Promise<HealthReport> {
    const periodLabel = options.period === '7days' ? '최근 7일' : options.period === '14days' ? '최근 14일' : '최근 30일';
    const highlights = [
      ...(options.includeSleep ? [{ label: '평균 수면', value: '6시간 22분', change: '이전보다 12분 감소' }] : []),
      ...(options.includeActivity ? [{ label: '평균 걸음', value: '6,430보', change: '이전보다 8% 증가' }] : []),
      ...(options.includeDiscomfort ? [{ label: '불편 기록', value: '목 4일', change: '가장 자주 기록' }] : []),
    ];
    return { id: `report-${Date.now()}`, periodLabel, createdAtLabel: new Date().toLocaleDateString('ko-KR'), headline: '수면이 짧은 날 목 불편이 자주 기록됐어요', highlights, discomfortAreas: options.includeDiscomfort ? ['목', '어깨'] : [], routineCount: options.includeRoutines ? (latestRoutineCompletion ? 3 : 2) : 0, note: '이 요약은 직접 기록한 생활 데이터에 기반하며 의료 진단서가 아니에요.', options };
  }

  async getRecordDetail(date: string): Promise<RecordDetail | null> {
    const record = latestRecordFor(date);
    if (!record) return null;
    const currentCheck = latestDailyCheck;
    const isLatest = currentCheck !== null && date === localDateId(new Date());
    return {
      ...record,
      bedtime: isLatest ? currentCheck.autoRecords.bedtime || '기록 없음' : '오전 12:18',
      sleepPosture: isLatest ? currentCheck.sleep.posture ?? '기록 없음' : '똑바로',
      pillow: isLatest ? currentCheck.sleep.pillow ?? '기록 없음' : '적당했어요',
      activityLabel: isLatest ? currentCheck.activitySkin.activity ?? '기록 없음' : '가볍게 움직였어요',
      skinStates: isLatest ? currentCheck.activitySkin.skinStates : ['괜찮아요'],
      feelings: isLatest ? currentCheck.discomfort.feelings : record.bodyParts.length > 0 ? ['뻐근해요'] : [],
      conditionTags: isLatest ? currentCheck.conditionTags : record.conditionTone === 'good' ? ['상쾌해요'] : ['피곤해요'],
    };
  }

  async getDiscoverSummary(endDate: string): Promise<DiscoverSummary> {
    const availableDates = Array.from({ length: 7 }, (_, index) => addDays(localDateId(new Date()), index - 6));
    const seed = Number(endDate.slice(-2)) || 1;
    return {
      endDate,
      availableDates,
      periodLabel: `${shortDate(addDays(endDate, -6))}–${shortDate(endDate)}`,
      sleepValues: userDataDeleted ? [] : [6.2, 5.8, 7.1, 6.5, 5.6, 6.8, 6.1].map((value, index) => Math.max(4.5, value + ((seed + index) % 3 - 1) * 0.12)),
      conditionValues: userDataDeleted ? [] : [3, 2, 4, 4, 2, 4, 3].map((value, index) => Math.max(1, Math.min(5, value + ((seed + index) % 2)))),
      activityValues: userDataDeleted ? [] : [4.2, 5.8, 8.1, 7.4, 3.9, 9.2, 6.3].map((value, index) => value + ((seed + index) % 3) * 0.3),
      labels: Array.from({ length: 7 }, (_, index) => shortDate(addDays(endDate, index - 6))),
      patterns: userDataDeleted ? [] : DISCOVER_PATTERNS,
    };
  }

  async getPatternDetail(patternId: string, endDate: string): Promise<PatternDetail | null> {
    const pattern = DISCOVER_PATTERNS.find((item) => item.id === patternId);
    if (!pattern) return null;
    const summary = await this.getDiscoverSummary(endDate);
    const chartData = patternId === 'steps-condition'
      ? { primary: summary.activityValues, secondary: summary.conditionValues, comparison: '걸음 수(천 보)와 컨디션 점수' }
      : patternId === 'bedtime-sleep'
        ? { primary: [23.4, 24.2, 23.8, 24.5, 25.1, 23.6, 24.4], secondary: summary.sleepValues, comparison: '취침 시각과 수면 시간' }
        : { primary: summary.sleepValues, secondary: [2, 4, 1, 2, 5, 1, 4], comparison: '수면 시간과 목 불편 강도' };
    return {
      ...pattern,
      endDate,
      evidence: patternId === 'sleep-neck' ? ['수면 6시간 미만인 날 3회', '다음 날 목 불편 평균 4.1단계', '최근 2주 중 5일 반복'] : patternId === 'steps-condition' ? ['6천 보 이상 걸은 날 4회', '해당 날짜 컨디션 평균 4.0점', '활동이 적은 날보다 21% 높음'] : ['자정 이후 취침 4회', '해당 날짜 수면 만족도 평균 2.8점', '평소보다 17% 낮음'],
      comparisonLabel: chartData.comparison,
      primaryValues: chartData.primary,
      secondaryValues: chartData.secondary,
      labels: summary.labels,
      suggestion: patternId === 'sleep-neck' ? '오늘은 평소보다 30분 일찍 누워 목 주변 긴장을 줄여보세요.' : patternId === 'steps-condition' ? '무리하지 않는 선에서 10분 산책으로 활동 흐름을 이어가 보세요.' : '취침 준비 알림을 활용해 자정 전에 눕는 흐름을 만들어 보세요.',
    };
  }

  async getRecordsMonth(year: number, month: number): Promise<RecordsMonth> {
    const records = (userDataDeleted ? [] : mockRecords).filter((record) => {
      const [recordYear, recordMonth] = record.date.split('-').map(Number);
      return recordYear === year && recordMonth === month;
    });
    const latestRecord = latestRecordFor(localDateId(new Date()));
    const mergedRecords = latestRecord && year === new Date().getFullYear() && month === new Date().getMonth() + 1
      ? [latestRecord, ...records.filter((record) => record.date !== latestRecord.date)]
      : records;
    return {
      year,
      month,
      records: mergedRecords,
      stats: {
        recordedDays: mergedRecords.length,
        averageSleep: mergedRecords.length > 0 ? '6시간 27분' : '-',
        discomfortDays: mergedRecords.filter((record) => record.bodyParts.length > 0).length,
      },
    };
  }

  async saveBaseline(_profile: BaselineProfile): Promise<void> {
    await Promise.resolve();
  }

  async saveDailyCheck(payload: DailyCheckSubmission): Promise<{ recordId: string }> {
    latestDailyCheck = payload;
    userDataDeleted = false;
    return { recordId: 'mock-daily-check' };
  }
}

// 실제 API 연동 시 이 인스턴스만 HttpWellnessApi 구현으로 교체합니다.
export const wellnessApi: WellnessApi = new MockWellnessApi();
