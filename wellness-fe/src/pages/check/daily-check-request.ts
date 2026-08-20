import type { DailyCheckDraft } from '@/context/daily-check-context';
import { saveDailyCheck as backendSaveDailyCheck, updateDailyCheck as backendUpdateDailyCheck } from '@/services/backend/daily-check';
import { hkAutoNumeric, PILLOW_BACKEND, resolvedSleepMin, SIT_LABELS_LONG, SLEEP_POSES, SLEEP_QUALITY_LABELS, type ConditionId } from './check.data';

/** 백엔드가 준 DailyCheckRequest 계약. bedtime 만 String 대신 `string | null` 로 뒀다 —
 * FE 는 취침·기상 시각 피커를 실제로 써야만 정확한 시각을 알 수 있고, +/- 스테퍼만
 * 쓴 경우엔 지어낼 수 없어서 모르는 채로(null) 보낸다. */
export type DailyCheckRequest = {
  autoRecords: {
    sleepDurationMinutes: number;
    bedtime: string | null;
    steps: number;
    source: 'apple-health' | 'health-connect' | 'manual';
  };
  condition: ConditionId;
  conditionTags: string[];
  discomfort: {
    feelings: string[];
    areas: { zoneId: string; view: 'front' | 'back'; intensity: number }[];
  };
  sleep: {
    satisfaction: number;
    posture: string;
    pillow: string;
  };
  activitySkin: {
    activity: string;
    skinStates: string[];
    memo: string;
  };
  skippedSteps: string[];
};

const fmtBedtime = (min: number | null) => {
  if (min === null) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * FE 초안(draft) → 백엔드 DailyCheckRequest. 값이 하나도 없는 항목은 어쩔 수 없이
 * 안전한 기본값(0, 빈 배열)으로 채운다 — 이건 검증을 UI 단에서 막지 않고 있다는
 * 뜻이라, 나중에 "필수 항목 비었을 때 저장 막기" 를 검토 단계에 추가하는 게 좋다.
 */
export function buildDailyCheckRequest(
  draft: DailyCheckDraft,
  healthProvider: 'apple-health' | 'health-connect',
): DailyCheckRequest {
  const auto = hkAutoNumeric(draft.hk, draft.hkAuto);
  const sleepMinutes = resolvedSleepMin(draft.hk, draft.hkManual, draft.hkAuto);
  const steps = draft.hkManual.steps ?? auto.steps ?? 0;
  const anyManual = draft.hkManual.sleep !== null || draft.hkManual.steps !== null || draft.hkManual.energy !== null;

  const poseLabel = draft.pose ? (SLEEP_POSES.find((p) => p.id === draft.pose)?.backend ?? '잘 모르겠어요') : '잘 모르겠어요';
  const satisfaction = draft.sleepQ !== null ? SLEEP_QUALITY_LABELS.length - draft.sleepQ : 3;
  const pillow = draft.pillow !== null ? PILLOW_BACKEND[draft.pillow] : PILLOW_BACKEND[1];

  return {
    autoRecords: {
      sleepDurationMinutes: sleepMinutes,
      bedtime: fmtBedtime(draft.bedtime),
      steps,
      source: anyManual ? 'manual' : healthProvider,
    },
    condition: draft.condition ?? 'okay',
    conditionTags: draft.conditionTags,
    discomfort: {
      feelings: draft.headache ? ['두통'] : [],
      areas: draft.parts.map((zoneId) => ({
        zoneId,
        view: zoneId.startsWith('back-') ? 'back' : 'front',
        intensity: draft.levels[zoneId] ?? 2,
      })),
    },
    sleep: { satisfaction, posture: poseLabel, pillow },
    activitySkin: {
      activity: draft.sit !== null ? SIT_LABELS_LONG[draft.sit] : '',
      skinStates: draft.skin,
      memo: draft.memo,
    },
    skippedSteps: draft.skippedSteps,
  };
}

export async function submitDailyCheckRequest(dateId: string, request: DailyCheckRequest, mode: 'create' | 'edit' = 'create'): Promise<{ recordId: string }> {
  const payload = { ...request, autoRecords: { ...request.autoRecords, bedtime: request.autoRecords.bedtime ?? undefined } };
  // 이미 있는 날짜를 고치는 거면 PATCH(수정)를, 새로 남기는 거면 POST(생성)를 쓴다.
  const response = mode === 'edit' ? await backendUpdateDailyCheck(dateId, payload) : await backendSaveDailyCheck(payload, dateId);
  return { recordId: response.id !== undefined ? String(response.id) : dateId };
}
