// 몸기록 백엔드 OpenAPI 스펙(components.schemas)을 그대로 옮긴 원시 DTO 타입.
// UI 표시용 타입은 `@/domain/wellness`를 사용하고, 이 파일은 백엔드 응답/요청 계약만 다룬다.

// ---- auth-controller ----

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignUpRequest = {
  email: string;
  password: string;
  name: string;
};

// 스펙에는 `type: object`로만 명시돼 있었지만, 실제 응답을 확인해 필드를 확정했다.
export type LoginResponse = {
  accessToken: string;
  userId: number;
  email?: string;
  name?: string;
  message?: string;
  [key: string]: unknown;
};

// ---- health-connection-controller ----

export type Permissions = {
  sleep?: boolean;
  steps?: boolean;
  heartRate?: boolean;
};

export type HealthConnectionRequest = {
  provider: string;
  connected: boolean;
  permissions: Permissions;
};

export type HealthConnectionResponse = {
  provider?: string;
  connected?: boolean;
  lastSyncedAt?: string;
  permissions?: Permissions;
};

// ---- health-data-controller ----

export type HealthDataSyncRequest = {
  date: string;
  source: string;
  sleepDurationMinutes?: number;
  bedtime?: string;
  steps?: number;
};

export type AutoHealthRecordResponse = {
  sleepDurationMinutes?: number;
  bedtime?: string;
  steps?: number;
  source?: string;
};

// ---- expert-card-controller ----

export type ExpertCardRequest = {
  period: string;
  startDate?: string;
  endDate?: string;
  includeSleep?: boolean;
  includeActivity?: boolean;
  includeDiscomfort?: boolean;
  includeRoutines?: boolean;
  hidePersonalInfo?: boolean;
};

export type HighlightResponse = {
  label?: string;
  value?: string;
  change?: string;
};

export type ExpertCardResponse = {
  id?: number;
  period?: string;
  startDate?: string;
  endDate?: string;
  headline?: string;
  highlights?: HighlightResponse[];
  discomfortAreas?: string[];
  sleepPostures?: string[];
  routineCount?: number;
  feedbackSummary?: string;
  discoveredPatterns?: string[];
  note?: string;
  createdAt?: string;
};

// ---- daily-check-controller ----

export type AutoRecordRequest = {
  sleepDurationMinutes?: number;
  bedtime?: string;
  steps?: number;
  source?: string;
};

export type PainAreaRequest = {
  zoneId: string;
  view: string;
  /** 1~5 */
  intensity: number;
};

export type DiscomfortRequest = {
  feelings?: string[];
  areas?: PainAreaRequest[];
};

export type SleepRequest = {
  /** 1~5 */
  satisfaction?: number;
  posture?: string;
  pillow?: string;
};

export type ActivitySkinRequest = {
  activity?: string;
  skinStates?: string[];
  memo?: string;
};

export type DailyCheckRequest = {
  autoRecords?: AutoRecordRequest;
  condition?: string;
  conditionTags?: string[];
  discomfort?: DiscomfortRequest;
  sleep?: SleepRequest;
  activitySkin?: ActivitySkinRequest;
  skippedSteps?: string[];
};

export type PainAreaResponse = {
  zoneId?: string;
  view?: string;
  intensity?: number;
};

export type SleepResponse = {
  satisfaction?: number;
  posture?: string;
  pillow?: string;
};

export type ActivitySkinResponse = {
  activity?: string;
  skinStates?: string[];
};

export type AutoRecordResponse = {
  sleepDurationMinutes?: number;
  bedtime?: string;
  steps?: number;
  source?: string;
};

export type DailyCheckResponse = {
  id?: number;
  date?: string;
  condition?: string;
  conditionTags?: string[];
  feelings?: string[];
  intensity?: number;
  painAreas?: PainAreaResponse[];
  sleep?: SleepResponse;
  activitySkin?: ActivitySkinResponse;
  autoRecords?: AutoRecordResponse;
  memo?: string;
  skippedSteps?: string[];
};

export type DayRecordResponse = {
  id?: number;
  date?: string;
  condition?: string;
  intensity?: number;
  zoneIds?: string[];
};

export type MonthStats = {
  recordedDays?: number;
  averageSleepMinutes?: number;
  discomfortDays?: number;
};

export type RecordsMonthResponse = {
  year?: number;
  month?: number;
  records?: DayRecordResponse[];
  stats?: MonthStats;
};

// ---- routine-feedback-controller ----

export type FeedbackType = 'IMMEDIATE' | 'DELAYED';
export type EffectStatus = 'IMPROVED' | 'SAME' | 'WORSE' | 'UNKNOWN';

export type FeedbackCreateRequest = {
  dailyRoutineId?: number;
  feedbackType?: FeedbackType;
  effectStatus?: EffectStatus;
  memo?: string;
};

export type FeedbackSummaryResponse = {
  feedbackId?: number;
  dailyRoutineId?: number;
  feedbackType?: string;
  effectStatus?: string;
  createdAt?: string;
};

export type PendingFeedbackResponse = {
  dailyRoutineId?: number;
  routineId?: number;
  targetArea?: string;
  targetDate?: string;
};

// ---- routine-completion-controller ----

export type CompletionResponse = {
  completionId?: number;
  routineId?: number;
  targetArea?: string;
  targetDate?: string;
  immediateFeedbackId?: number;
  delayedFeedbackId?: number;
};

// ---- routine-controller ----

export type RoutineDetailResponse = {
  routineId?: number;
  targetArea?: string;
  description?: string;
  totalDurationMinutes?: number;
  precautions?: string;
  stepsData?: Record<string, unknown>[];
};

export type TodayRoutineResponse = {
  dailyRoutineId?: number;
  routineId?: number;
  targetArea?: string;
  totalDurationMinutes?: number;
  isCompleted?: boolean;
};

// ---- pattern-controller ----

export type PatternResponse = {
  id?: number;
  patternName?: string;
  patternType?: string;
  sourceMetric?: string;
  targetMetric?: string;
  relationDirection?: string;
  status?: string;
  analysisStartDate?: string;
  analysisEndDate?: string;
};

// ---- connection-controller ----

export type PainAreaDTO = {
  zoneId?: string;
  intensity?: number;
};

export type PainConnectionResponse = {
  id?: number;
  userId?: number;
  checkDate?: string;
  condition?: string;
  sleepSatisfaction?: number;
  skinStates?: string[];
  autoSleepDurationMinutes?: number;
  autoSteps?: number;
  painAreas?: PainAreaDTO[];
};

// ---- 웰니스챗 ----

export type ChatRequest = {
  message: string;
};

export type ChatResponse = {
  reply?: string;
  guardrailPassed?: boolean;
  violations?: string[];
};

// ---- 지속신호안내 ----

export type PersistentSignalResponse = {
  id?: number;
  painArea?: string;
  triggerType?: string;
  streakDays?: number;
  messageSent?: string;
  triggeredAt?: string;
};
