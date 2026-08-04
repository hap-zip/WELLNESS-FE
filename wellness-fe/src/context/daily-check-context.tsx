import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';

export type CheckStep = 'auto' | 'condition' | 'discomfort' | 'sleep' | 'activitySkin';

type DailyCheckDraft = {
  autoRecords: { sleepDuration: string; bedtime: string; steps: string };
  autoConfirmed: boolean;
  condition: string | null;
  conditionTags: string[];
  bodyParts: string[];
  intensity: number | null;
  discomfortFeelings: string[];
  sleepSatisfaction: number | null;
  sleepPosture: string | null;
  pillow: string | null;
  activity: string | null;
  skinStates: string[];
  memo: string;
  skippedSteps: CheckStep[];
};

const initialDraft: DailyCheckDraft = {
  autoRecords: { sleepDuration: '5시간 42분', bedtime: '오전 1:18', steps: '4,230보' },
  autoConfirmed: false,
  condition: null,
  conditionTags: [],
  bodyParts: [],
  intensity: null,
  discomfortFeelings: [],
  sleepSatisfaction: null,
  sleepPosture: null,
  pillow: null,
  activity: null,
  skinStates: [],
  memo: '',
  skippedSteps: [],
};

type DailyCheckContextValue = {
  completeStep: (step: CheckStep) => void;
  completedCount: number;
  draft: DailyCheckDraft;
  resetDraft: () => void;
  skipStep: (step: CheckStep) => void;
  updateDraft: (changes: Partial<DailyCheckDraft>) => void;
};

const DailyCheckContext = createContext<DailyCheckContextValue | null>(null);

export function DailyCheckProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState<DailyCheckDraft>(initialDraft);
  const updateDraft = (changes: Partial<DailyCheckDraft>) => setDraft((current) => ({ ...current, ...changes }));
  const completeStep = (step: CheckStep) => setDraft((current) => ({ ...current, skippedSteps: current.skippedSteps.filter((item) => item !== step) }));
  const skipStep = (step: CheckStep) => setDraft((current) => {
    const cleared: Partial<DailyCheckDraft> = step === 'auto' ? { autoConfirmed: false }
      : step === 'condition' ? { condition: null, conditionTags: [] }
        : step === 'discomfort' ? { bodyParts: [], intensity: null, discomfortFeelings: [] }
          : step === 'sleep' ? { sleepSatisfaction: null, sleepPosture: null, pillow: null }
            : { activity: null, skinStates: [], memo: '' };
    return {
      ...current,
      ...cleared,
      skippedSteps: current.skippedSteps.includes(step) ? current.skippedSteps : [...current.skippedSteps, step],
    };
  });
  const completedCount = [
    draft.autoConfirmed,
    draft.condition !== null,
    draft.bodyParts.length > 0 && draft.intensity !== null,
    draft.sleepSatisfaction !== null && draft.sleepPosture !== null,
    draft.activity !== null && draft.skinStates.length > 0,
  ].filter(Boolean).length;

  const value = useMemo(() => ({
    completeStep,
    completedCount,
    draft,
    resetDraft: () => setDraft(initialDraft),
    skipStep,
    updateDraft,
  }), [completedCount, draft]);

  return <DailyCheckContext.Provider value={value}>{children}</DailyCheckContext.Provider>;
}

export function useDailyCheck() {
  const context = useContext(DailyCheckContext);
  if (!context) throw new Error('useDailyCheck must be used inside DailyCheckProvider');
  return context;
}
