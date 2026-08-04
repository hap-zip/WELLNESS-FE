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
