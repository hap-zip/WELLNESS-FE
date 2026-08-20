import { healthSyncService } from '@/services/health-sync-service';
import { appleHealthService } from '@/services/apple-health-service';
import { ApiError } from '@/services/api-error';
import { getHealthConnection, saveHealthConnection } from '@/services/backend/health-connection';
import { getHealthDataByDate, syncHealthData } from '@/services/backend/health-data';
import { getDailyCheckDetail, saveDailyCheck, updateDailyCheck, deleteDailyCheck, getDailyChecksMonth } from '@/services/backend/daily-check';
import { getTodayRoutine, getRoutineDetail } from '@/services/backend/routine';
import { completeRoutine } from '@/services/backend/routine-completion';
import { saveFeedback } from '@/services/backend/routine-feedback';
import { checkPersistentSignals, checkWorseningSignals, checkNoImprovementSignals } from '@/services/backend/persistent-signal';
import { createExpertCard, deleteExpertCard, getExpertCard, listExpertCards } from '@/services/backend/expert-card';
import { sendChatMessage } from '@/services/backend/chat';
import { ZONE_LABELS } from '@/pages/check/check.data';
import { toLocalDateId } from '@/utils/date';

import type { AssistantMessage, AssistantReply, AutoHealthRecord, DailyCheckSubmission, DataConsentSettings, DiscoverSummary, HealthConnectionSettings, HealthReport, HomeSummary, NotificationSettings, PatternDetail, RecordDetail, RecordsMonth, ReportOptions, ReportPeriod, RoutineCompletion, RoutineFeedback, RoutinePlan, RoutineStep, SignalSummary, UserProfileSummary, WellnessRecordSummary } from '@/domain/wellness';
import type { DailyCheckRequest as RawDailyCheckRequest, DailyCheckResponse, EffectStatus, ExpertCardResponse } from '@/types/api';

export interface WellnessApi {
  getAutoHealthRecord(date?: string): Promise<AutoHealthRecord>;
  getHomeSummary(): Promise<HomeSummary>;
  getDiscoverSummary(endDate: string, periodDays?: number): Promise<DiscoverSummary>;
  getPatternDetail(patternId: string, endDate: string): Promise<PatternDetail | null>;
  getDailyCheck(date: string): Promise<DailyCheckSubmission | null>;
  deleteDailyCheck(date: string): Promise<void>;
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
  saveDailyCheck(payload: DailyCheckSubmission): Promise<{ recordId: string }>;
  updateDailyCheck(date: string, payload: DailyCheckSubmission): Promise<{ recordId: string }>;
  listHealthReports(): Promise<HealthReport[]>;
  getHealthReport(id: string): Promise<HealthReport | null>;
  deleteHealthReport(id: string): Promise<void>;
}

function notImplemented(): never {
  throw new ApiError('아직 지원하지 않는 기능이에요.', undefined, 'NOT_IMPLEMENTED');
}

function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

function formatMinutes(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return '기록 없음';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}

function parseSleepLabel(label: string): number {
  const match = label.match(/(\d+)시간(?:\s*(\d+)분)?/);
  return match ? Number(match[1]) * 60 + Number(match[2] ?? 0) : 0;
}

function formatSteps(steps: number | null | undefined): string {
  if (steps === null || steps === undefined) return '기록 없음';
  return `${steps.toLocaleString('ko-KR')}보`;
}

function parseStepsLabel(label: string): number {
  const match = label.match(/([\d,]+)보/);
  return match ? Number(match[1].replace(/,/g, '')) : 0;
}

function toAutoHealthRecord(source: { sleepDurationMinutes?: number; bedtime?: string; steps?: number; source?: string } | undefined): AutoHealthRecord {
  const provider = source?.source === 'health-connect' ? 'health-connect' : source?.source === 'manual' ? 'manual' : 'apple-health';
  return {
    sleepDuration: formatMinutes(source?.sleepDurationMinutes),
    bedtime: source?.bedtime ?? '기록 없음',
    steps: formatSteps(source?.steps),
    // 백엔드 응답(AutoHealthRecordResponse)에 활동 에너지 필드가 없다.
    activityEnergy: '기록 없음',
    source: provider,
  };
}

function conditionToneFromIntensity(intensity: number | null | undefined): 'good' | 'caution' | 'danger' {
  if (intensity === null || intensity === undefined) return 'good';
  if (intensity >= 4) return 'danger';
  if (intensity >= 2) return 'caution';
  return 'good';
}

function zoneLabel(zoneId: string | undefined): string {
  if (!zoneId) return '';
  return ZONE_LABELS[zoneId] ?? zoneId;
}

// zoneId는 "front-shoulder-left"처럼 하이픈이 있어 정규식에서 그대로 써도 안전하다.
const ZONE_ID_PATTERN = new RegExp(Object.keys(ZONE_LABELS).sort((a, b) => b.length - a.length).join('|'), 'g');

/** 전문가 카드의 headline/highlight 문구는 백엔드가 zoneId를 문장에 그대로 끼워 보낸다 (예: "front-shoulder-left 1일") — 한글 라벨로 치환한다. */
function translateZoneIds(value: string): string {
  return value.replace(ZONE_ID_PATTERN, (zoneId) => ZONE_LABELS[zoneId] ?? zoneId);
}

function toDailyCheckSubmission(date: string, response: DailyCheckResponse): DailyCheckSubmission {
  const intensity = response.intensity ?? null;
  return {
    date: response.date ?? date,
    autoRecords: toAutoHealthRecord(response.autoRecords),
    condition: response.condition ?? null,
    conditionTags: response.conditionTags ?? [],
    discomfort: {
      bodyParts: (response.painAreas ?? []).map((area) => area.zoneId ?? ''),
      intensity,
      feelings: response.feelings ?? [],
      areas: (response.painAreas ?? []).map((area) => ({
        id: area.zoneId ?? '',
        label: zoneLabel(area.zoneId),
        view: area.view === 'back' ? 'back' as const : 'front' as const,
        intensity: area.intensity ?? 1,
      })),
    },
    sleep: {
      satisfaction: response.sleep?.satisfaction ?? null,
      posture: response.sleep?.posture ?? null,
      pillow: response.sleep?.pillow ?? null,
    },
    activitySkin: {
      activity: response.activitySkin?.activity ?? null,
      skinStates: response.activitySkin?.skinStates ?? [],
      memo: response.memo ?? '',
      // 백엔드가 사진 업로드를 지원하지 않는다.
      photoUri: null,
    },
    skippedSteps: response.skippedSteps ?? [],
  };
}

function toDailyCheckRequestPayload(payload: DailyCheckSubmission): RawDailyCheckRequest {
  return {
    autoRecords: {
      sleepDurationMinutes: parseSleepLabel(payload.autoRecords.sleepDuration),
      bedtime: payload.autoRecords.bedtime,
      steps: parseStepsLabel(payload.autoRecords.steps),
      source: payload.autoRecords.source,
    },
    condition: payload.condition ?? undefined,
    conditionTags: payload.conditionTags,
    discomfort: {
      feelings: payload.discomfort.feelings,
      areas: payload.discomfort.areas.map((area) => ({ zoneId: area.id, view: area.view, intensity: area.intensity })),
    },
    sleep: {
      satisfaction: payload.sleep.satisfaction ?? undefined,
      posture: payload.sleep.posture ?? undefined,
      pillow: payload.sleep.pillow ?? undefined,
    },
    activitySkin: {
      activity: payload.activitySkin.activity ?? undefined,
      skinStates: payload.activitySkin.skinStates,
      memo: payload.activitySkin.memo,
    },
    skippedSteps: payload.skippedSteps,
  };
}

function toWellnessRecordSummary(id: string, date: string, condition: string | null, intensity: number | null, bodyParts: string[]): WellnessRecordSummary {
  return {
    id,
    date,
    condition: condition ?? '기록 없음',
    conditionTone: conditionToneFromIntensity(intensity),
    sleepDuration: '기록 없음',
    steps: '기록 없음',
    bodyParts,
    intensity,
    memo: '',
  };
}

/** 백엔드 ExpertCardRequest.period가 실제로 받는 값(ReportPeriod.java 기준) — 목록 표시용 한글 라벨. */
const REPORT_PERIOD_LABELS: Record<ReportPeriod, string> = {
  '3days': '최근 3일',
  '7days': '최근 7일',
  '14days': '최근 14일',
  custom: '직접 설정',
};

function toHealthReport(card: ExpertCardResponse, options: ReportOptions): HealthReport {
  return {
    id: card.id !== undefined ? String(card.id) : `report-${Date.now()}`,
    // 전문가 카드 응답에는 이름이 없다 (개인정보 숨김 옵션과의 정합성).
    userName: '',
    periodLabel: card.startDate && card.endDate ? `${card.startDate} – ${card.endDate}` : REPORT_PERIOD_LABELS[options.period],
    createdAtLabel: card.createdAt ? new Date(card.createdAt).toLocaleDateString('ko-KR') : new Date().toLocaleDateString('ko-KR'),
    headline: translateZoneIds(card.headline ?? ''),
    highlights: (card.highlights ?? []).map((highlight) => ({
      label: highlight.label ?? '',
      value: translateZoneIds(highlight.value ?? ''),
      change: translateZoneIds(highlight.change ?? ''),
    })),
    // 백엔드가 돌려주는 discomfortAreas는 우리가 daily-check 때 보낸 zoneId 그대로라
    // (예: "front-shoulder-left") 한글 라벨로 바꿔서 보여준다.
    discomfortAreas: (card.discomfortAreas ?? []).map(zoneLabel),
    sleepPostures: card.sleepPostures ?? [],
    routineCount: card.routineCount ?? 0,
    feedbackSummary: translateZoneIds(card.feedbackSummary ?? ''),
    discoveredPatterns: (card.discoveredPatterns ?? []).map(translateZoneIds),
    note: card.note ?? '',
    options,
  };
}

/** 목록/상세 조회 응답에는 원래 요청한 옵션(포함 항목 체크박스)이 그대로 안 실려 와서,
 * 실제로 채워진 데이터로부터 최선으로 다시 추정한다. */
function inferReportOptions(card: ExpertCardResponse): ReportOptions {
  const period: ReportPeriod = card.period === '3days' || card.period === '7days' || card.period === '14days' || card.period === 'custom'
    ? card.period
    : card.startDate && card.endDate ? 'custom' : '7days';
  return {
    period,
    customStartDate: card.startDate,
    customEndDate: card.endDate,
    includeSleep: (card.sleepPostures ?? []).length > 0,
    includeActivity: false,
    includeDiscomfort: (card.discomfortAreas ?? []).length > 0,
    includeRoutines: (card.routineCount ?? 0) > 0,
    hidePersonalInfo: false,
  };
}

function toRoutineSteps(stepsData: Record<string, unknown>[] | undefined): RoutineStep[] {
  if (!stepsData) return [];
  return stepsData.map((step, index) => {
    const order = typeof step.order === 'number' ? step.order : index + 1;
    const id = typeof step.id === 'string' || typeof step.id === 'number' ? String(step.id) : String(index);
    // 백엔드 stepsData는 {sec, text, order} 형태로 온다 — title/name, instruction/description은
    // 실제로는 없는 필드라 이전 매핑이 항상 빈 문자열·0초로 떨어졌다. text/sec를 우선한다.
    const title = typeof step.title === 'string' ? step.title : typeof step.name === 'string' ? step.name : `동작 ${order}`;
    const instruction = typeof step.text === 'string' ? step.text : typeof step.instruction === 'string' ? step.instruction : typeof step.description === 'string' ? step.description : '';
    const durationSeconds = typeof step.sec === 'number' ? step.sec : typeof step.durationSeconds === 'number' ? step.durationSeconds : typeof step.duration === 'number' ? step.duration : 0;
    const side = step.side === 'left' || step.side === 'right' || step.side === 'center' ? step.side : undefined;
    return { id, title, instruction, durationSeconds, side };
  });
}

class HttpWellnessApi implements WellnessApi {
  async getUserProfile(): Promise<UserProfileSummary> {
    return notImplemented();
  }

  async getHealthConnection(): Promise<HealthConnectionSettings> {
    const response = await getHealthConnection();
    const provider = response.provider === 'health-connect' ? 'health-connect' : 'apple-health';
    const backendConnected = Boolean(response.connected);
    // 백엔드의 연결 기록이 기기 상태와 어긋날 수 있어(예: 연동 당시 저장 실패), Apple 건강은
    // 실제로 HealthKit 권한을 요청한 적이 있는지를 기준으로 다시 확인해 화면에 반영한다.
    const deviceConnected = provider === 'apple-health' && !backendConnected && (await appleHealthService.hasRequestedAuthorization());
    return {
      provider,
      connected: backendConnected || deviceConnected,
      lastSyncedLabel: response.lastSyncedAt ? new Date(response.lastSyncedAt).toLocaleString('ko-KR') : null,
      permissions: deviceConnected
        ? { sleep: true, steps: true, activityEnergy: true, heartRate: Boolean(response.permissions?.heartRate) }
        : {
          sleep: Boolean(response.permissions?.sleep),
          steps: Boolean(response.permissions?.steps),
          // 백엔드에 활동 에너지 권한 필드가 따로 없어 걸음 수 권한과 함께 취급한다.
          activityEnergy: Boolean(response.permissions?.steps),
          heartRate: Boolean(response.permissions?.heartRate),
        },
    };
  }

  async saveHealthConnection(settings: HealthConnectionSettings): Promise<void> {
    await saveHealthConnection({
      provider: settings.provider,
      connected: settings.connected,
      permissions: { sleep: settings.permissions.sleep, steps: settings.permissions.steps, heartRate: settings.permissions.heartRate },
    });
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    return notImplemented();
  }

  async saveNotificationSettings(): Promise<void> {
    return notImplemented();
  }

  async getDataConsentSettings(): Promise<DataConsentSettings> {
    return notImplemented();
  }

  async saveDataConsentSettings(): Promise<void> {
    return notImplemented();
  }

  async deleteAllUserData(): Promise<void> {
    return notImplemented();
  }

  async getHomeSummary(): Promise<HomeSummary> {
    return notImplemented();
  }

  async getDiscoverSummary(): Promise<DiscoverSummary> {
    return notImplemented();
  }

  async getPatternDetail(): Promise<PatternDetail | null> {
    return notImplemented();
  }

  async askRecordAssistant(message: string): Promise<AssistantReply> {
    const response = await sendChatMessage({ message });
    return {
      message: { id: `assistant-${Date.now()}`, role: 'assistant', text: response.reply ?? '', createdAt: new Date().toISOString() },
      suggestions: [],
    };
  }

  async getAutoHealthRecord(date = toLocalDateId()): Promise<AutoHealthRecord> {
    const connection = await this.getHealthConnection();
    if (!connection.connected) throw new Error('건강 데이터가 연결되지 않았어요.');
    if (connection.provider !== 'apple-health') throw new Error('현재 빌드에서는 Apple 건강 데이터만 실제 조회할 수 있어요.');
    try {
      const record = await healthSyncService.getDailyRecord(date, connection);
      // 기기에서 읽은 값을 서버에도 동기화해둔다 — 실패해도 화면에는 영향 없다.
      void syncHealthData({
        date,
        source: record.source,
        sleepDurationMinutes: parseSleepLabel(record.sleepDuration) || undefined,
        bedtime: record.bedtime !== '기록 없음' ? record.bedtime : undefined,
        steps: parseStepsLabel(record.steps) || undefined,
      }).catch(() => undefined);
      return record;
    } catch (error) {
      // 기기에서 못 읽으면(과거 데이터가 이미 지워졌거나 권한 문제) 서버에 동기화해둔 값이라도 보여준다.
      try {
        return toAutoHealthRecord(await getHealthDataByDate(date));
      } catch {
        throw error;
      }
    }
  }

  async getDailyCheck(date: string): Promise<DailyCheckSubmission | null> {
    try {
      const response = await getDailyCheckDetail(date);
      return toDailyCheckSubmission(date, response);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async deleteDailyCheck(date: string): Promise<void> {
    await deleteDailyCheck(date);
  }

  async saveDailyCheck(payload: DailyCheckSubmission): Promise<{ recordId: string }> {
    const response = await saveDailyCheck(toDailyCheckRequestPayload(payload), payload.date);
    return { recordId: response.id !== undefined ? String(response.id) : `daily-check-${payload.date}` };
  }

  async getRecordDetail(date: string): Promise<RecordDetail | null> {
    let response: DailyCheckResponse;
    try {
      response = await getDailyCheckDetail(date);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
    const submission = toDailyCheckSubmission(date, response);
    const summary = toWellnessRecordSummary(`daily-check-${date}`, date, submission.condition, submission.discomfort.intensity, submission.discomfort.areas.map((area) => area.label));
    return {
      ...summary,
      sleepDuration: submission.autoRecords.sleepDuration,
      steps: submission.autoRecords.steps,
      memo: submission.activitySkin.memo,
      bedtime: submission.autoRecords.bedtime,
      sleepPosture: submission.sleep.posture ?? '기록 없음',
      pillow: submission.sleep.pillow ?? '기록 없음',
      activityLabel: submission.activitySkin.activity ?? '기록 없음',
      skinStates: submission.activitySkin.skinStates,
      feelings: submission.discomfort.feelings,
      conditionTags: submission.conditionTags,
      // daily-check 응답만으로는 완료한 루틴·다음 날 피드백을 신뢰성 있게 연결할 방법이 없다.
      completedRoutine: null,
      nextDayFeedback: null,
    };
  }

  async getRecordsMonth(year: number, month: number): Promise<RecordsMonth> {
    const response = await getDailyChecksMonth(year, month);
    const records = (response.records ?? []).map((record) =>
      toWellnessRecordSummary(String(record.id ?? record.date ?? ''), record.date ?? '', record.condition ?? null, record.intensity ?? null, (record.zoneIds ?? []).map(zoneLabel)),
    );
    return {
      year: response.year ?? year,
      month: response.month ?? month,
      records,
      stats: {
        recordedDays: response.stats?.recordedDays ?? 0,
        averageSleep: formatMinutes(response.stats?.averageSleepMinutes),
        discomfortDays: response.stats?.discomfortDays ?? 0,
      },
    };
  }

  async getTodayRoutine(): Promise<RoutinePlan> {
    const today = await getTodayRoutine();
    const detail = today.routineId !== undefined ? await getRoutineDetail(today.routineId) : undefined;
    // targetArea는 백엔드가 zoneId("back-neck")를 그대로 준다 — 화면 제목·GIF 매칭에 쓰려면
    // 한글 라벨("목 뒤")로 바꿔야 한다.
    const targetArea = zoneLabel(detail?.targetArea ?? today.targetArea);
    const totalSeconds = (detail?.totalDurationMinutes ?? today.totalDurationMinutes ?? 0) * 60;
    return {
      id: String(today.dailyRoutineId ?? today.routineId ?? ''),
      title: targetArea ? `${targetArea} 루틴` : '오늘의 루틴',
      description: detail?.description ?? '',
      // 백엔드가 추천 이유·강도를 제공하지 않는다.
      reason: '',
      intensity: '가볍게',
      targetArea,
      totalSeconds,
      caution: detail?.precautions ?? '',
      steps: toRoutineSteps(detail?.stepsData),
    };
  }

  async saveRoutineCompletion(routineId: string, completedSeconds: number, completedSteps: number): Promise<RoutineCompletion> {
    await completeRoutine(Number(routineId));
    // 완료 API는 소요 시간·완료 단계 수를 받지 않고 응답 바디도 없어, 클라이언트 값을 그대로 되돌려준다.
    return { completionId: `local-${Date.now()}`, routineId, completedAt: new Date().toISOString(), completedSeconds, completedSteps };
  }

  async saveRoutineFeedback(feedback: RoutineFeedback): Promise<{ feedbackId: string; shouldShowSignal: boolean }> {
    const effectStatus: EffectStatus = feedback.effect === 'better' ? 'IMPROVED' : feedback.effect === 'worse' ? 'WORSE' : feedback.effect === 'same' ? 'SAME' : 'UNKNOWN';
    await saveFeedback({ dailyRoutineId: Number(feedback.routineId), feedbackType: 'IMMEDIATE', effectStatus, memo: feedback.memo });
    const [persistent, worsening, noImprovement] = await Promise.all([
      checkPersistentSignals(),
      checkWorseningSignals(),
      checkNoImprovementSignals(),
    ]);
    const shouldShowSignal = persistent.length > 0 || worsening.length > 0 || noImprovement.length > 0;
    return { feedbackId: `local-${Date.now()}`, shouldShowSignal };
  }

  async getSignalSummary(): Promise<SignalSummary> {
    const [persistent, worsening, noImprovement] = await Promise.all([
      checkPersistentSignals(),
      checkWorseningSignals(),
      checkNoImprovementSignals(),
    ]);
    const signal = persistent[0] ?? worsening[0] ?? noImprovement[0];
    if (!signal) {
      return { title: '아직 반복된 신호가 없어요', description: '기록이 더 쌓이면 반복되는 흐름을 알려드릴게요.', durationLabel: '', occurrences: 0, evidence: [], guidance: [] };
    }
    const area = signal.painArea ?? '기록된 부위';
    return {
      title: `${area} 불편이 계속 기록되고 있어요`,
      description: signal.messageSent ?? '',
      durationLabel: signal.streakDays ? `최근 ${signal.streakDays}일` : '',
      occurrences: signal.streakDays ?? 0,
      // 백엔드 응답에 근거·대응 가이드 목록이 없다.
      evidence: [],
      guidance: [],
    };
  }

  async createHealthReport(options: ReportOptions): Promise<HealthReport> {
    const card = await createExpertCard({
      period: options.period,
      startDate: options.customStartDate,
      endDate: options.customEndDate,
      includeSleep: options.includeSleep,
      includeActivity: options.includeActivity,
      includeDiscomfort: options.includeDiscomfort,
      includeRoutines: options.includeRoutines,
      hidePersonalInfo: options.hidePersonalInfo,
    });
    return toHealthReport(card, options);
  }

  async listHealthReports(): Promise<HealthReport[]> {
    const cards = await listExpertCards();
    return cards.map((card) => toHealthReport(card, inferReportOptions(card)));
  }

  async getHealthReport(id: string): Promise<HealthReport | null> {
    const cardId = Number(id);
    if (!Number.isFinite(cardId)) return null;
    try {
      const card = await getExpertCard(cardId);
      return toHealthReport(card, inferReportOptions(card));
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async deleteHealthReport(id: string): Promise<void> {
    const cardId = Number(id);
    if (!Number.isFinite(cardId)) return;
    await deleteExpertCard(cardId);
  }

  async updateDailyCheck(date: string, payload: DailyCheckSubmission): Promise<{ recordId: string }> {
    const response = await updateDailyCheck(date, toDailyCheckRequestPayload(payload));
    return { recordId: response.id !== undefined ? String(response.id) : `daily-check-${date}` };
  }
}

export const wellnessApi: WellnessApi = new HttpWellnessApi();
