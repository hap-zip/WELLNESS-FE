export type AutoHealthRecord = {
  sleepDuration: string;
  bedtime: string;
  steps: string;
  activityEnergy: string;
  source: 'apple-health' | 'health-connect' | 'manual';
};

export type BodyMapPart = 'neck' | 'shoulder' | 'chest' | 'upperArm' | 'forearm' | 'abdomen' | 'hip' | 'thigh' | 'knee' | 'calf';

export type BodyMuscleSlug = 'abs' | 'biceps' | 'calves' | 'chest' | 'deltoids' | 'forearm' | 'knees' | 'neck' | 'obliques' | 'quadriceps' | 'tibialis' | 'trapezius';

export type BodyMapHighlight = {
  part: BodyMapPart;
  muscle: BodyMuscleSlug;
  intensity: 1 | 2 | 3;
};

export type BodyPartDetail = {
  title: string;
  lines: { label: string; value: string }[];
};

export type HomeSummary = {
  dateLabel: string;
  conditionLabel: string;
  evidence: string;
  tags: { id: string; label: string; tone: 'primary' | 'danger' | 'neutral' }[];
  recentRecords: { id: string; date: string; value: string }[];
  insight: { text: string; tags: { id: string; label: string; tone: 'primary' | 'danger' | 'neutral' }[] };
  routine: { title: string; description: string; duration: string; intensity: string };
  tips: string[];
  sleepTrend: { values: number[]; averageLabel: string; periodLabel: string };
  bodyHighlights: BodyMapHighlight[];
  bodyDetails: Record<BodyMapPart, BodyPartDetail>;
  pendingFeedback?: { routineId: string; title: string; question: string };
  routineEffectLabel?: string;
  streakDays: number;
  checkState: 'not-started' | 'completed';
  recentPattern?: { title: string; description: string };
};

export type DailyCheckSubmission = {
  date: string;
  autoRecords: AutoHealthRecord;
  condition: string | null;
  conditionTags: string[];
  discomfort: { bodyParts: string[]; intensity: number | null; feelings: string[]; headache?: boolean; areas: { id: string; label: string; view: 'front' | 'back'; intensity: number; feelings?: string[] }[] };
  sleep: { satisfaction: number | null; posture: string | null; pillow: string | null; minutes?: number };
  activitySkin: { activity: string | null; activities?: string[]; skinStates: string[]; trouble?: boolean; troubleSpots?: string[]; memo: string; photoUri: string | null };
  skippedSteps: string[];
};

export type WellnessRecordSummary = {
  id: string;
  date: string;
  condition: string;
  conditionTone: 'good' | 'caution' | 'danger';
  sleepDuration: string;
  steps: string;
  bodyParts: string[];
  intensity: number | null;
    memo: string;
    routineCompleted?: boolean;
  };

export type RecordsMonth = {
  year: number;
  month: number;
  records: WellnessRecordSummary[];
  stats: {
    recordedDays: number;
    averageSleep: string;
    discomfortDays: number;
  };
};

export type RecordDetail = WellnessRecordSummary & {
  bedtime: string;
  sleepPosture: string;
  pillow: string;
  activityLabel: string;
  skinStates: string[];
  feelings: string[];
  conditionTags: string[];
  completedRoutine?: { title: string; completedAt: string } | null;
  nextDayFeedback?: { effect: RoutineEffect; discomfortLevel: number } | null;
};

export type DiscoverPattern = {
  id: string;
  title: string;
  summary: string;
  metric: string;
  tone: 'primary' | 'caution' | 'danger';
  confidence: 'collecting' | 'possible' | 'repeated' | 'changed';
  confidenceLabel: string;
};

export type ConnectionMetricId = 'sleep' | 'discomfort' | 'posture' | 'steps' | 'skin' | 'routine';
export type ConnectionMetric = { id: ConnectionMetricId; label: string; shortLabel: string; unit: string; values: number[] };
export type ConnectionDayDetail = { date: string; dateLabel: string; sleep: string; posture: string; discomfort: string; steps: string; skin: string; routine: string };
export type PersonalBaseline = { ready: boolean; recordedDays: number; targetDays: number; averageSleep: string; averageSteps: string; averageBedtime: string; discomfortFrequency: string; comparison: string };

export type DiscoverSummary = {
  startDate: string;
  endDate: string;
  availableDates: string[];
  periodLabel: string;
  sleepValues: number[];
  conditionValues: number[];
  activityValues: number[];
  labels: string[];
  patterns: DiscoverPattern[];
  analysisReadiness: { ready: boolean; recordedDays: number; requiredDays: number };
  baseline: PersonalBaseline;
  metrics: ConnectionMetric[];
  dayDetails: ConnectionDayDetail[];
  lowRelations: string[];
  moreDataGuide: string;
};

export type PatternDetail = DiscoverPattern & {
  endDate: string;
  evidence: string[];
  comparisonLabel: string;
  primaryValues: number[];
  secondaryValues: number[];
  labels: string[];
  suggestion: string;
};

export type RoutineStep = {
  id: string;
  title: string;
  instruction: string;
  durationSeconds: number;
  side?: 'left' | 'right' | 'center';
};

export type RoutinePlan = {
  id: string;
  title: string;
  description: string;
  reason: string;
  intensity: '가볍게' | '보통';
  targetArea: string;
  totalSeconds: number;
  caution: string;
  steps: RoutineStep[];
};

export type RoutineCompletion = {
  completionId: string;
  routineId: string;
  completedAt: string;
  completedSeconds: number;
  completedSteps: number;
};

export type RoutineEffect = 'better' | 'same' | 'worse' | 'unknown';
export type RoutineFeedback = { routineId: string; effect: RoutineEffect; discomfortLevel: number; memo: string };
export type SignalSummary = { title: string; description: string; durationLabel: string; occurrences: number; evidence: string[]; guidance: string[] };
export type ReportPeriod = '3days' | '7days' | '14days' | 'custom';
export type ReportOptions = { period: ReportPeriod; customStartDate?: string; customEndDate?: string; includeSleep: boolean; includeActivity: boolean; includeDiscomfort: boolean; includeRoutines: boolean; hidePersonalInfo: boolean };
export type HealthReport = { id: string; userName: string; periodLabel: string; createdAtLabel: string; headline: string; highlights: { label: string; value: string; change: string }[]; discomfortAreas: string[]; sleepPostures: string[]; routineCount: number; feedbackSummary: string; discoveredPatterns: string[]; note: string; options: ReportOptions };

export type AssistantMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  createdAt: string;
};

export type AssistantReply = {
  message: AssistantMessage;
  suggestions: string[];
  references?: { label: string; value: string }[];
  officialInfo?: { productName: string; ingredient: string; efficacy: string; cautions: string[]; sourceLabel: string; sourceUrl: string };
  action?: { label: string; route: '/check/auto' | '/routine' | '/reports/setup' | '/(tabs)/records' | '/safety/signal' };
};

export type UserProfileSummary = { name: string; email: string; joinedLabel: string; recordDays: number; routineCount: number; healthConnected: boolean; notificationEnabled: boolean };
export type HealthConnectionSettings = { provider: 'apple-health' | 'health-connect'; connected: boolean; lastSyncedLabel: string | null; permissions: { sleep: boolean; steps: boolean; activityEnergy: boolean; heartRate: boolean } };
export type NotificationSettings = { enabled: boolean; osPermission: 'granted' | 'denied' | 'not-determined'; dailyCheck: boolean; routine: boolean; weeklyReport: boolean; nextDayEffect: boolean; persistentSignal: boolean; reminderTime: string };
export type DataConsentSettings = { healthData: boolean; personalizedInsights: boolean; marketing: boolean; consentedAtLabel: string; retentionLabel: string };
