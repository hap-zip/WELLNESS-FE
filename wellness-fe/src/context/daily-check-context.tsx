import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import type { DailyCheckSubmission } from '@/domain/wellness';

export type CheckStep = 'auto' | 'condition' | 'discomfort' | 'sleep' | 'activitySkin';

type DailyCheckDraft = {
  targetDate: string | null;
  mode: 'create' | 'edit';
  autoRecords: { sleepDuration: string; bedtime: string; steps: string; activityEnergy: string };
  autoSource: 'apple-health' | 'health-connect' | 'manual';
  autoConfirmed: boolean;
  condition: string | null;
  conditionTags: string[];
  bodyParts: string[];
  intensity: number | null;
  bodyView: 'front' | 'back';
  bodyAreaIntensities: Record<string, number>;
  bodyAreaFeelings: Record<string, string[]>;
  discomfortFeelings: string[];
  headache: boolean;
  sleepMinutes: number;
  sleepSatisfaction: number | null;
  sleepPosture: string | null;
  pillow: string | null;
  activity: string | null;
  activities: string[];
  skinStates: string[];
  skinTrouble: boolean;
  troubleSpots: string[];
  skinPhotoUri: string | null;
  memo: string;
  skippedSteps: CheckStep[];
};

const initialDraft: DailyCheckDraft = {
  targetDate: null,
  mode: 'create',
  autoRecords: { sleepDuration: '', bedtime: '', steps: '', activityEnergy: '' },
  autoSource: 'manual',
  autoConfirmed: false,
  condition: null,
  conditionTags: [],
  bodyParts: [],
  intensity: null,
  bodyView: 'front',
  bodyAreaIntensities: {},
  bodyAreaFeelings: {},
  discomfortFeelings: [],
  headache: false,
  sleepMinutes: 420,
  sleepSatisfaction: null,
  sleepPosture: null,
  pillow: null,
  activity: null,
  activities: [],
  skinStates: [],
  skinTrouble: false,
  troubleSpots: [],
  skinPhotoUri: null,
  memo: '',
  skippedSteps: [],
};

type DailyCheckContextValue = {
  completeStep: (step: CheckStep) => void;
  completedCount: number;
  draft: DailyCheckDraft;
  resetDraft: () => void;
  startDraft: (date: string, mode: 'create' | 'edit', submission?: DailyCheckSubmission | null) => void;
  skipStep: (step: CheckStep) => void;
  updateDraft: (changes: Partial<DailyCheckDraft>) => void;
};

const DailyCheckContext = createContext<DailyCheckContextValue | null>(null);

export function DailyCheckProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState<DailyCheckDraft>(initialDraft);
  const updateDraft = useCallback((changes: Partial<DailyCheckDraft>) => setDraft((current) => ({ ...current, ...changes })), []);
  const completeStep = useCallback((step: CheckStep) => setDraft((current) => ({ ...current, skippedSteps: current.skippedSteps.filter((item) => item !== step) })), []);
  const skipStep = useCallback((step: CheckStep) => setDraft((current) => {
    const cleared: Partial<DailyCheckDraft> = step === 'auto' ? { autoConfirmed: false }
      : step === 'condition' ? { condition: null, conditionTags: [] }
        : step === 'discomfort' ? { bodyParts: [], intensity: null, bodyAreaIntensities: {}, bodyAreaFeelings: {}, discomfortFeelings: [], headache: false }
          : step === 'sleep' ? { sleepSatisfaction: null, sleepPosture: null, pillow: null, sleepMinutes: 420 }
            : { activity: null, activities: [], skinStates: [], skinTrouble: false, troubleSpots: [], skinPhotoUri: null, memo: '' };
    return {
      ...current,
      ...cleared,
      skippedSteps: current.skippedSteps.includes(step) ? current.skippedSteps : [...current.skippedSteps, step],
    };
  }), []);
  const resetDraft = useCallback(() => setDraft(initialDraft), []);
  const startDraft = useCallback((date: string, mode: 'create' | 'edit', submission?: DailyCheckSubmission | null) => {
    if (!submission) {
      setDraft({ ...initialDraft, targetDate: date, mode });
      return;
    }
    setDraft({
      targetDate: date,
      mode,
      autoRecords: { sleepDuration: submission.autoRecords.sleepDuration, bedtime: submission.autoRecords.bedtime, steps: submission.autoRecords.steps, activityEnergy: submission.autoRecords.activityEnergy ?? '' },
      autoSource: submission.autoRecords.source,
      autoConfirmed: true,
      condition: submission.condition,
      conditionTags: [...submission.conditionTags],
      bodyParts: [...submission.discomfort.bodyParts],
      intensity: submission.discomfort.intensity,
      bodyView: submission.discomfort.areas[0]?.view ?? 'front',
      bodyAreaIntensities: Object.fromEntries(submission.discomfort.areas.map((area) => [area.id, area.intensity])),
      bodyAreaFeelings: Object.fromEntries(submission.discomfort.areas.map((area) => [area.id, area.feelings ?? submission.discomfort.feelings])),
      discomfortFeelings: [...submission.discomfort.feelings],
      headache: submission.discomfort.headache ?? false,
      sleepMinutes: submission.sleep.minutes ?? 420,
      sleepSatisfaction: submission.sleep.satisfaction,
      sleepPosture: submission.sleep.posture,
      pillow: submission.sleep.pillow,
      activity: submission.activitySkin.activity,
      activities: [...(submission.activitySkin.activities ?? [])],
      skinStates: [...submission.activitySkin.skinStates],
      skinTrouble: submission.activitySkin.trouble ?? false,
      troubleSpots: [...(submission.activitySkin.troubleSpots ?? [])],
      skinPhotoUri: submission.activitySkin.photoUri,
      memo: submission.activitySkin.memo,
      skippedSteps: submission.skippedSteps.filter((step): step is CheckStep => ['auto', 'condition', 'discomfort', 'sleep', 'activitySkin'].includes(step)),
    });
  }, []);
  const completedCount = [
    draft.autoConfirmed,
    draft.bodyParts.length === 0 || draft.bodyParts.every((part) => draft.bodyAreaIntensities[part] !== undefined),
    draft.sleepPosture !== null,
  ].filter(Boolean).length;

  const value = useMemo(() => ({
    completeStep,
    completedCount,
    draft,
    resetDraft,
    startDraft,
    skipStep,
    updateDraft,
  }), [completeStep, completedCount, draft, resetDraft, skipStep, startDraft, updateDraft]);

  return <DailyCheckContext.Provider value={value}>{children}</DailyCheckContext.Provider>;
}

export function useDailyCheck() {
  const context = useContext(DailyCheckContext);
  if (!context) throw new Error('useDailyCheck must be used inside DailyCheckProvider');
  return context;
}
