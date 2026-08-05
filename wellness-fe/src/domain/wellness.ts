export type AutoHealthRecord = {
  sleepDuration: string;
  bedtime: string;
  steps: string;
  source: 'apple-health' | 'health-connect' | 'manual';
};

export type BodyMapPart = 'neck' | 'shoulder' | 'chest' | 'upperArm' | 'forearm' | 'abdomen' | 'hip' | 'thigh' | 'knee' | 'calf';

export type BodyMuscleSlug = 'abs' | 'biceps' | 'calves' | 'chest' | 'deltoids' | 'forearm' | 'knees' | 'neck' | 'obliques' | 'quadriceps' | 'tibialis' | 'trapezius';

export type BodyMapHighlight = {
  part: BodyMapPart;
  muscle: BodyMuscleSlug;
  color: string;
  intensity: 1 | 2 | 3;
};

export type BodyPartDetail = {
  title: string;
  lines: Array<{ label: string; value: string }>;
};

export type HomeSummary = {
  dateLabel: string;
  conditionLabel: string;
  evidence: string;
  tags: Array<{ id: string; label: string; tone: 'primary' | 'danger' | 'neutral' }>;
  recentRecords: Array<{ id: string; date: string; value: string }>;
  insight: { text: string; tags: Array<{ id: string; label: string; tone: 'primary' | 'danger' | 'neutral' }> };
  routine: { title: string; description: string; duration: string; intensity: string };
  tips: string[];
  sleepTrend: { values: number[]; averageLabel: string; periodLabel: string };
  bodyHighlights: BodyMapHighlight[];
  bodyDetails: Record<BodyMapPart, BodyPartDetail>;
};

export type BaselineProfile = {
  bedtime: Date;
  wakeTime: Date;
  discomfortAreas: string[];
  activityLevel: '낮음' | '보통' | '높음';
  notificationTime: Date;
};

export type DailyCheckSubmission = {
  autoRecords: AutoHealthRecord;
  condition: string | null;
  conditionTags: string[];
  discomfort: { bodyParts: string[]; intensity: number | null; feelings: string[] };
  sleep: { satisfaction: number | null; posture: string | null; pillow: string | null };
  activitySkin: { activity: string | null; skinStates: string[]; memo: string };
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
};

export type DiscoverPattern = {
  id: string;
  title: string;
  summary: string;
  metric: string;
  tone: 'primary' | 'caution' | 'danger';
};

export type DiscoverSummary = {
  endDate: string;
  availableDates: string[];
  periodLabel: string;
  sleepValues: number[];
  conditionValues: number[];
  activityValues: number[];
  labels: string[];
  patterns: DiscoverPattern[];
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

export type RoutineEffect = 'better' | 'same' | 'worse';
export type RoutineFeedback = { routineId: string; effect: RoutineEffect; discomfortLevel: number; memo: string };
export type SignalSummary = { title: string; description: string; durationLabel: string; occurrences: number; evidence: string[]; guidance: string[] };
export type ReportPeriod = '7days' | '14days' | '30days';
export type ReportOptions = { period: ReportPeriod; includeSleep: boolean; includeActivity: boolean; includeDiscomfort: boolean; includeRoutines: boolean };
export type HealthReport = { id: string; periodLabel: string; createdAtLabel: string; headline: string; highlights: Array<{ label: string; value: string; change: string }>; discomfortAreas: string[]; routineCount: number; note: string; options: ReportOptions };

export type AssistantMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  createdAt: string;
};

export type AssistantReply = {
  message: AssistantMessage;
  suggestions: string[];
  action?: { label: string; route: '/check/auto' | '/routine' | '/reports/setup' | '/(tabs)/records' | '/safety/signal' };
};
