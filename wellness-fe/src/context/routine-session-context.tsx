import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import type { RoutineCompletion, RoutineEffect, RoutinePlan } from '@/domain/wellness';
import { wellnessApi } from '@/services/wellness-api';
import { userFacingError } from '@/services/api-error';

type FeedbackResult = { feedbackId: string; shouldShowSignal: boolean };

type RoutineSessionContextValue = {
  plan: RoutinePlan | null;
  loading: boolean;
  loadError: string;
  loadPlan: () => Promise<void>;
  moveIndex: number;
  goToMove: (index: number) => void;
  sessionStartedAt: number | null;
  beginSession: () => void;
  completion: RoutineCompletion | null;
  completing: boolean;
  completeError: string;
  completeSession: (completedSteps: number) => Promise<void>;
  feedbackResult: FeedbackResult | null;
  submittingFeedback: boolean;
  feedbackError: string;
  submitFeedback: (effect: RoutineEffect, memo: string) => Promise<void>;
  reset: () => void;
};

const RoutineSessionContext = createContext<RoutineSessionContextValue | null>(null);

export function RoutineSessionProvider({ children }: PropsWithChildren) {
  const [plan, setPlan] = useState<RoutinePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [moveIndex, setMoveIndex] = useState(0);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [completion, setCompletion] = useState<RoutineCompletion | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState('');
  const [feedbackResult, setFeedbackResult] = useState<FeedbackResult | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  const loadPlan = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const result = await wellnessApi.getTodayRoutine();
      setPlan(result);
    } catch (reason) {
      setLoadError(userFacingError(reason, '오늘의 루틴을 불러오지 못했어요.'));
    } finally {
      setLoading(false);
    }
  }, []);

  const goToMove = useCallback((index: number) => setMoveIndex(index), []);
  const beginSession = useCallback(() => {
    setMoveIndex(0);
    setSessionStartedAt(Date.now());
    setCompletion(null);
    setFeedbackResult(null);
  }, []);

  const completeSession = useCallback(async (completedSteps: number) => {
    if (!plan || completing) return;
    setCompleting(true);
    setCompleteError('');
    const completedSeconds = sessionStartedAt ? Math.round((Date.now() - sessionStartedAt) / 1000) : 0;
    try {
      const result = await wellnessApi.saveRoutineCompletion(plan.id, completedSeconds, completedSteps);
      setCompletion(result);
    } catch (reason) {
      setCompleteError(userFacingError(reason, '루틴 완료를 저장하지 못했어요.'));
    } finally {
      setCompleting(false);
    }
  }, [plan, sessionStartedAt, completing]);

  const submitFeedback = useCallback(async (effect: RoutineEffect, memo: string) => {
    if (!completion || submittingFeedback) return;
    setSubmittingFeedback(true);
    setFeedbackError('');
    try {
      const result = await wellnessApi.saveRoutineFeedback({ routineId: completion.routineId, effect, discomfortLevel: 0, memo });
      setFeedbackResult(result);
    } catch (reason) {
      setFeedbackError(userFacingError(reason, '피드백을 보내지 못했어요.'));
    } finally {
      setSubmittingFeedback(false);
    }
  }, [completion, submittingFeedback]);

  const reset = useCallback(() => {
    setPlan(null);
    setMoveIndex(0);
    setSessionStartedAt(null);
    setCompletion(null);
    setFeedbackResult(null);
    setCompleteError('');
    setFeedbackError('');
  }, []);

  const value = useMemo(() => ({
    plan, loading, loadError, loadPlan,
    moveIndex, goToMove, sessionStartedAt, beginSession,
    completion, completing, completeError, completeSession,
    feedbackResult, submittingFeedback, feedbackError, submitFeedback,
    reset,
  }), [plan, loading, loadError, loadPlan, moveIndex, goToMove, sessionStartedAt, beginSession, completion, completing, completeError, completeSession, feedbackResult, submittingFeedback, feedbackError, submitFeedback, reset]);

  return <RoutineSessionContext.Provider value={value}>{children}</RoutineSessionContext.Provider>;
}

export function useRoutineSession() {
  const context = useContext(RoutineSessionContext);
  if (!context) throw new Error('useRoutineSession must be used inside RoutineSessionProvider');
  return context;
}
