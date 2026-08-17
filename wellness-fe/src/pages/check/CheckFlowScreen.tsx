import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Animated, Image, Linking, Modal, Pressable, StyleSheet, Text, TextInput, View, type ViewStyle } from 'react-native';
import { SvgUri } from 'react-native-svg';
import type { Href } from 'expo-router';

import { CHEKI } from '@/lib/cheki';
import { BodyMap } from '@/components/body-map';
import {
  CameraGlyph, ChipRemoveGlyph, HkGlyph, RetryGlyph, SmallCloseGlyph,
} from '@/components/glyphs';
import { useDailyCheck, type CheckPhoto, type DailyCheckDraft } from '@/context/daily-check-context';
import { wellnessApi } from '@/services/wellness-api';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import type { Palette } from '@/theme/palette';
import {
  BODY_MAP_SCALE, CONDITION_OPTIONS, CONDITION_TAGS, FEELS, fmtSleep, HK_KEY_FOR, hkNoteFor, hkRowsFor,
  PILLOW_LABELS, resolvedSleepMin, SIT_LABELS_LONG, SIT_LABELS_SHORT, SKIN_STATES,
  SLEEP_POSES, SLEEP_QUALITY_LABELS, TROUBLE_SPOTS, ZONES, ZONE_LABELS, type HkField,
} from './check.data';
import { buildDailyCheckRequest, submitDailyCheckRequest } from './daily-check-request';
import { CheckFlowShell } from './CheckFlowShell';

/**
 * `Momgirok v8.dc.html` → `<sc-if value="{{ isCheck }}">` 를 백엔드 DailyCheckRequest DTO에
 * 맞춰 5단계로 재구성한 것 — 원래 프로토타입은 6단계였지만, "오늘 컨디션"은 가벼워서
 * 자동 수집과 한 화면으로 묶었고, "불편 부위 선택"과 "강도·느낌"은 항상 짝으로 붙어
 * 다녀서 부위를 고르면 바로 그 아래에서 강도·느낌을 남기는 한 화면으로 합쳤다.
 * 각 단계가 실제 라우트를 겸하도록 `router.replace` 로 URL 도 함께 맞춘다.
 */

const STEP_ROUTES: Href[] = ['/check/auto', '/check/discomfort', '/check/sleep', '/check/activity-skin', '/check/review'];

export default function CheckFlowScreen({ initialStep }: { initialStep: number }) {
  const router = useRouter();
  const { draft, updateDraft } = useDailyCheck();
  const step = draft.step;
  const noParts = draft.parts.length === 0;
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (draft.step !== initialStep) updateDraft({ step: initialStep });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStep]);

  const leaveHome = () => router.dismissTo('/(tabs)/home');
  /** B-12 — 입력한 내용이 있는데 닫으려 하면 먼저 확인받는다. 그냥 두면(context가 살아있는 한) 이어서 쓸 수 있으니 "임시 저장"에 해당한다. */
  const goHome = () => {
    if (!hasDraftInput(draft)) { leaveHome(); return; }
    Alert.alert('임시 저장할까요?', '지금 나가면 입력한 내용을 임시로 저장해 둘게요.', [
      { text: '계속 작성', style: 'cancel' },
      { text: '나가기', onPress: leaveHome },
    ]);
  };
  const goStep = (n: number) => { updateDraft({ step: n, prevStep: step }); router.replace(STEP_ROUTES[n]); };

  const onBack = () => {
    if (step === 0) { goHome(); return; }
    goStep(step - 1);
  };
  const onNext = () => {
    if (step === 4) { void submitAndFinish(); return; }
    goStep(step + 1);
  };

  /** B-12 — 저장 실패 시 토스트 대신 이 앱 관례(Alert)로 안내하고 재시도할 수 있게 둔다. 입력값은 그대로 남는다. */
  const submitAndFinish = async () => {
    setSaving(true);
    try {
      const settings = await wellnessApi.getHealthConnection();
      const provider = settings.provider === 'health-connect' ? 'health-connect' : 'apple-health';
      const request = buildDailyCheckRequest(draft, provider);
      const dateId = draft.targetDate ?? new Date().toISOString().slice(0, 10);
      await submitDailyCheckRequest(dateId, request);
      router.replace('/check/complete');
    } catch {
      Alert.alert('저장하지 못했어요', '다시 시도해 주세요. 입력한 내용은 남아 있어요.');
    } finally {
      setSaving(false);
    }
  };

  const cta = step === 4 ? (saving ? '저장하는 중…' : '기록 저장하기')
    : step === 1 && noParts ? '불편 없이 넘어가기'
    : '다음';
  const character = step === 1 ? CHEKI.painCheck : step === 2 ? CHEKI.sleep : step === 4 ? CHEKI.recording : undefined;

  return (
    <CheckFlowShell character={character} cta={cta} ctaDisabled={saving} onBack={onBack} onClose={goHome} onNext={onNext} previousStep={draft.prevStep} step={step}>
      {step === 0 && <StepAuto />}
      {step === 1 && <StepDiscomfort />}
      {step === 2 && <StepSleep />}
      {step === 3 && <StepActivitySkin />}
      {step === 4 && <StepReview onEdit={goStep} />}
    </CheckFlowShell>
  );
}

/* ── 공용 토글 스위치 (두통 / 트러블) ─────────────────────────── */

function ToggleSwitch({ c, on, onToggle, label }: { c: Palette; on: boolean; onToggle: () => void; label: string }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="switch" accessibilityState={{ checked: on }} onPress={onToggle} style={[s.switchTrack, { backgroundColor: on ? c.pri : c.g300 }]}>
      <View style={[s.switchKnob, { left: on ? 23 : 3 }]} />
    </Pressable>
  );
}

/** B-12 — 닫기 전에 확인이 필요할 만큼 뭔가 입력했는지 훑어본다. */
function hasDraftInput(draft: DailyCheckDraft) {
  return draft.condition !== null || draft.conditionTags.length > 0 || draft.parts.length > 0
    || draft.hkManual.sleep !== null || draft.hkManual.steps !== null || draft.hkManual.energy !== null
    || draft.sleepQ !== null || draft.pose !== null || draft.pillow !== null || draft.sit !== null
    || draft.skin.length > 0 || draft.trouble || draft.headache || draft.memo.trim().length > 0
    || draft.photos.length > 0;
}

/** B-4 동기화 중 상태 — 값 자리에 0이나 "· · ·" 텍스트 대신 스켈레톤을 보여준다. */
function ValueSkeleton({ c }: { c: Palette }) {
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={[s.hkSkeleton, { backgroundColor: c.g200, opacity }]} />;
}

/* ── 1단계 — 자동 수집 + 오늘 컨디션 ──────────────────────────── */

function StepAuto() {
  const c = usePalette();
  const { draft, updateDraft, toggleConditionTag } = useDailyCheck();
  const rows = hkRowsFor(draft.hk, draft.hkManual, draft.hkAuto);
  const note = hkNoteFor(draft.hk);
  const err = draft.hk === 'err';
  const [manualField, setManualField] = useState<HkField | null>(null);
  const [manualHours, setManualHours] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');
  const [manualCount, setManualCount] = useState('');
  const [retrying, setRetrying] = useState(false);

  const loadConnection = useCallback(async () => {
    try {
      const settings = await wellnessApi.getHealthConnection();
      if (!settings.connected) {
        updateDraft({ hk: 'perm', hkAuto: { sleep: null, steps: null, energy: null } });
        return;
      }
      const record = await wellnessApi.getAutoHealthRecord(draft.targetDate ?? undefined);
      updateDraft({ hk: 'ok', hkAuto: numericHealthRecord(record) });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const state = /연결되지|먼저 건강 데이터 설정/.test(message) ? 'perm' : /기록이 없|NO_HEALTH_DATA/.test(message) ? 'none' : 'err';
      updateDraft({ hk: state, hkAuto: { sleep: null, steps: null, energy: null } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateDraft({ hk: 'sync' });
    void loadConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openManual = (field: HkField) => {
    setManualField(field);
    if (field === 'sleep') {
      const cur = draft.hkManual.sleep;
      setManualHours(cur !== null ? String(Math.floor(cur / 60)) : '');
      setManualMinutes(cur !== null ? String(cur % 60) : '');
    } else {
      setManualCount(draft.hkManual[field] !== null ? String(draft.hkManual[field]) : '');
    }
  };
  const applyManual = () => {
    if (!manualField) return;
    if (manualField === 'sleep') {
      const h = Number(manualHours) || 0;
      const m = Number(manualMinutes) || 0;
      if (h || m) updateDraft({ hkManual: { ...draft.hkManual, sleep: h * 60 + m } });
    } else {
      const n = Number(manualCount);
      if (manualCount.trim() && Number.isFinite(n) && n >= 0) updateDraft({ hkManual: { ...draft.hkManual, [manualField]: Math.round(n) } });
    }
    setManualField(null);
  };
  const retry = () => {
    setRetrying(true);
    updateDraft({ hk: 'sync' });
    void loadConnection().finally(() => setRetrying(false));
  };
  const runAction = (a: string, field: HkField) => {
    if (a === '직접 입력') openManual(field);
    else if (a === '다시 시도') retry();
    else if (a === '설정에서 허용') void Linking.openSettings();
  };
  const manualValid = manualField === 'sleep' ? Boolean(Number(manualHours) || Number(manualMinutes)) : manualCount.trim().length > 0 && Number.isFinite(Number(manualCount));

  return (
    <>
      <View style={s.hkRows}>
        {rows.map((row) => {
          const cardBorder = row.tone === 'warn' ? c.g300 : row.tone === 'err' ? c.danger : c.g200;
          const cardBg = row.tone === 'warn' ? c.g100 : row.tone === 'err' ? c.dangerBg : c.card;
          const iconColor = row.tone === 'err' ? c.dangerDk : c.g700;
          const srcColor = row.tone === 'err' ? c.dangerDk : row.tone === 'warn' ? c.g600 : c.g500;
          const valueColor = row.tone === 'muted' ? c.g400 : c.g900;
          return (
            <View key={row.key} style={[s.hkCard, { borderColor: cardBorder, backgroundColor: cardBg }]}>
              <View style={s.hkCardRow}>
                <View style={[s.hkIconWrap, { backgroundColor: row.tone === 'err' ? c.card : c.g100 }]}>
                  <HkGlyph color={iconColor} id={row.icon} />
                </View>
                <View style={s.flex1}>
                  <Text style={[text({ size: 14.5, weight: 700 }), { color: c.g900 }]}>{row.label}</Text>
                  <Text style={[text({ size: 11.5 }), s.hkSrc, { color: srcColor }]}>{row.source}</Text>
                </View>
                {draft.hk === 'sync' ? <ValueSkeleton c={c} /> : (
                  <Text style={[text({ size: row.value.length > 6 ? 16 : 18, weight: 700, tracking: -0.04, tabular: true }), { color: valueColor }]}>{row.value}</Text>
                )}
              </View>
              {row.actions ? (
                <View style={[s.hkActions, { borderTopColor: c.g200 }]}>
                  {row.actions.map((a, i) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ busy: retrying && a === '다시 시도' }}
                      disabled={retrying && a === '다시 시도'}
                      key={a}
                      onPress={() => runAction(a, row.field)}
                      style={[s.hkActionBtn, i ? { borderWidth: 1, borderColor: c.g300 } : { backgroundColor: c.g900 }, retrying && a === '다시 시도' && { opacity: 0.6 }]}>
                      <Text style={[text({ size: 12.5, weight: 700 }), { color: i ? c.g700 : c.card }]}>{retrying && a === '다시 시도' ? '확인하는 중…' : a}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={[s.hkNote, { backgroundColor: err ? c.dangerBg : c.g100 }]}>
        <Text style={[text({ size: 12, leading: 1.65 }), { color: err ? c.dangerDk : c.g600 }]}>{note}</Text>
      </View>

      <Text style={[text({ size: 13.5, weight: 700 }), s.blockLabel26, { color: c.g700 }]}>오늘 컨디션은 어때요?</Text>
      <View style={s.conditionRow}>
        {CONDITION_OPTIONS.map((opt) => {
          const on = draft.condition === opt.id;
          return (
            <Pressable key={opt.id} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => updateDraft({ condition: opt.id })} style={[s.conditionBtn, { borderColor: on ? c.pri : c.g200, backgroundColor: on ? c.priLightest : c.card }]}>
              <Text style={[text({ size: 13, weight: on ? 700 : 500 }), { color: on ? c.priDk : c.g600 }]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[text({ size: 11.5, weight: 700 }), s.partFormSubLabel2, { color: c.g500 }]}>해당하는 게 있다면 골라주세요 · 여러 개 선택 가능</Text>
      <View style={s.feelRow}>
        {CONDITION_TAGS.map((tag) => {
          const on = draft.conditionTags.includes(tag);
          return (
            <Pressable key={tag} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => toggleConditionTag(tag)} style={[s.feelChip, { borderColor: on ? c.g900 : c.g200, backgroundColor: on ? c.g900 : 'transparent' }]}>
              <Text style={[text({ size: 12.5, weight: on ? 700 : 500 }), { color: on ? c.card : c.g600 }]}>{tag}</Text>
            </Pressable>
          );
        })}
      </View>

      <Modal animationType="fade" onRequestClose={() => setManualField(null)} transparent visible={manualField !== null}>
        <View style={s.modalBackdrop}>
          <View style={[s.modalCard, { backgroundColor: c.card }]}>
            <Text style={[text({ size: 17, weight: 700, tracking: -0.035 }), { color: c.g900 }]}>{manualField ? HK_KEY_FOR[manualField] : ''} 직접 입력</Text>
            {manualField === 'sleep' ? (
              <View style={s.manualSleepRow}>
                <View style={s.manualSleepField}>
                  <TextInput autoFocus keyboardType="number-pad" onChangeText={setManualHours} placeholder="0" placeholderTextColor={c.g400} style={[s.manualInput, { borderColor: c.g300, color: c.g900 }]} value={manualHours} />
                  <Text style={[text({ size: 12.5, weight: 600 }), s.manualUnit, { color: c.g600 }]}>시간</Text>
                </View>
                <View style={s.manualSleepField}>
                  <TextInput keyboardType="number-pad" onChangeText={setManualMinutes} placeholder="0" placeholderTextColor={c.g400} style={[s.manualInput, { borderColor: c.g300, color: c.g900 }]} value={manualMinutes} />
                  <Text style={[text({ size: 12.5, weight: 600 }), s.manualUnit, { color: c.g600 }]}>분</Text>
                </View>
              </View>
            ) : (
              <TextInput
                autoFocus
                keyboardType="number-pad"
                onChangeText={setManualCount}
                placeholder={manualField === 'steps' ? '예: 4200' : '예: 320'}
                placeholderTextColor={c.g400}
                style={[s.manualInput, { borderColor: c.g300, color: c.g900 }]}
                value={manualCount}
              />
            )}
            <View style={s.modalBtnRow}>
              <Pressable accessibilityRole="button" onPress={() => setManualField(null)} style={[s.modalBtn, { borderWidth: 1, borderColor: c.g300 }]}>
                <Text style={[text({ size: 14.5, weight: 700 }), { color: c.g700 }]}>취소</Text>
              </Pressable>
              <Pressable accessibilityRole="button" disabled={!manualValid} onPress={applyManual} style={[s.modalBtn, { backgroundColor: c.pri, opacity: manualValid ? 1 : 0.5 }]}>
                <Text style={[text({ size: 14.5, weight: 700 }), { color: '#fff' }]}>적용</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function numericHealthRecord(record: { sleepDuration: string; steps: string; activityEnergy: string }) {
  const hours = Number(record.sleepDuration.match(/(\d+)시간/)?.[1] ?? 0);
  const minutes = Number(record.sleepDuration.match(/(\d+)분/)?.[1] ?? 0);
  const steps = Number(record.steps.replace(/[^\d]/g, ''));
  const energy = Number(record.activityEnergy.replace(/[^\d]/g, ''));
  return {
    sleep: hours || minutes ? hours * 60 + minutes : null,
    steps: Number.isFinite(steps) && /\d/.test(record.steps) ? steps : null,
    energy: Number.isFinite(energy) && /\d/.test(record.activityEnergy) ? energy : null,
  };
}

/* ── 2단계 — 불편 부위 + 강도·느낌 ────────────────────────────── */

function StepDiscomfort() {
  const c = usePalette();
  const { draft, updateDraft, togglePart, setLevel, toggleFeel } = useDailyCheck();
  const zones = ZONES.filter((z) => z.view === draft.view);

  return (
    <>
      <View style={s.bodyViewRow}>
        {(['front', 'back'] as const).map((v) => {
          const active = draft.view === v;
          return (
            <Pressable key={v} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => updateDraft({ view: v })} style={[s.bodyViewPill, { borderColor: active ? c.pri : c.g300, backgroundColor: active ? c.pri : c.card }]}>
              <Text style={[text({ size: 13.5, weight: active ? 700 : 500 }), { color: active ? '#fff' : c.g600 }]}>{v === 'front' ? '앞면' : '뒷면'}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[s.mapWrap, { backgroundColor: c.g100 }]}>
        <View style={s.mapInner}>
          <BodyMap height={328} variant="selectable" width={212} />
          {zones.map((z) => {
            const on = draft.parts.includes(z.id);
            return (
              <Pressable
                key={z.id}
                accessibilityLabel={z.label}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => togglePart(z.id)}
                style={[
                  s.zoneBtn,
                  {
                    left: z.left * BODY_MAP_SCALE, top: z.top * BODY_MAP_SCALE,
                    width: z.width * BODY_MAP_SCALE, height: z.height * BODY_MAP_SCALE,
                  },
                  on && { borderWidth: 2, borderColor: c.danger, backgroundColor: 'rgba(255,59,59,.17)', ...glow(c.danger) },
                ]}
              />
            );
          })}
        </View>
      </View>
      <Text style={[text({ size: 12, leading: 1.65 }), s.mapCaption, { color: c.g500 }]}>부위를 눌러 선택하세요. 좌우와 앞·뒤는 따로 기록됩니다.</Text>

      {draft.parts.length > 0 ? (
        <View style={s.chipRow}>
          {draft.parts.map((id) => (
            <View key={id} style={[s.zoneChip, { backgroundColor: c.dangerBg }]}>
              <Text style={[text({ size: 12.5, weight: 700 }), { color: c.dangerDk }]}>{ZONE_LABELS[id] ?? id}</Text>
              <Pressable accessibilityLabel={`${ZONE_LABELS[id] ?? id} 선택 해제`} accessibilityRole="button" onPress={() => togglePart(id)} style={[s.zoneChipRemove, { backgroundColor: c.danger }]}>
                <ChipRemoveGlyph />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      {draft.parts.length > 0 ? (
        <View style={s.partFormList}>
          {draft.parts.map((id) => {
            const lv = draft.levels[id] ?? 2;
            const fs = draft.feels[id] ?? [];
            return (
              <View key={id} style={[s.partForm, { borderColor: c.g200 }]}>
                <View style={s.partFormHead}>
                  <View style={[s.partDot, { backgroundColor: c.danger }]} />
                  <Text style={[text({ size: 15, weight: 700 }), s.flex1, { color: c.g900 }]}>{ZONE_LABELS[id] ?? id}</Text>
                  <Text style={[text({ size: 13, weight: 700 }), { color: c.danger }]}>{lv}단계</Text>
                </View>

                <Text style={[text({ size: 12.5, weight: 600 }), s.partFormSubLabel, { color: c.g600 }]}>강도</Text>
                <View style={s.levelRow}>
                  {[1, 2, 3, 4, 5].map((v) => {
                    const sel = lv === v;
                    return (
                      <Pressable key={v} accessibilityLabel={`강도 ${v}단계`} accessibilityRole="button" accessibilityState={{ selected: sel }} onPress={() => setLevel(id, v)} style={[s.levelBtn, { borderColor: sel ? c.danger : c.g200, backgroundColor: sel ? c.dangerBg : c.card }]}>
                        <Text style={[text({ size: 15, weight: 700, tabular: true }), { color: sel ? c.dangerDk : c.g500 }]}>{v}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={[text({ size: 12.5, weight: 600 }), s.partFormSubLabel2, { color: c.g600 }]}>느낌 · 여러 개 선택 가능</Text>
                <View style={s.feelRow}>
                  {FEELS.map((fl) => {
                    const on = fs.includes(fl);
                    return (
                      <Pressable key={fl} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => toggleFeel(id, fl)} style={[s.feelChip, { borderColor: on ? c.g900 : c.g200, backgroundColor: on ? c.g900 : c.card }]}>
                        <Text style={[text({ size: 12.5, weight: on ? 700 : 500 }), { color: on ? c.card : c.g600 }]}>{fl}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      <View style={[s.toggleRow, { borderColor: c.g200 }]}>
        <Text style={[text({ size: 14.5, weight: 700, tracking: -0.03 }), { color: c.g900 }]}>두통이 있었나요?</Text>
        <View style={s.headacheRow}>
          {[{ v: true, label: '예' }, { v: false, label: '아니오' }].map((opt) => {
            const sel = draft.headache === opt.v;
            return (
              <Pressable key={opt.label} accessibilityRole="button" accessibilityState={{ selected: sel }} onPress={() => updateDraft({ headache: opt.v })} style={[s.headachePill, { borderColor: sel ? c.pri : c.g200, backgroundColor: sel ? c.priLightest : c.card }]}>
                <Text style={[text({ size: 13.5, weight: sel ? 700 : 500 }), { color: sel ? c.priDk : c.g600 }]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </>
  );
}

/* ── 3단계 — 수면 ─────────────────────────────────────────── */

/** 자세 7종 중 "옆으로/엎드려서/웅크려서/세우고"를 정확히 구분해 그린 무료 아이콘은
 * 없다(Iconify 20만+ 아이콘 전수 검색 확인) — 그래서 실제 침대·수면 아이콘(Iconify,
 * solar 세트) 위에 실제 방향 화살표 아이콘을 겹쳐 방향만 표현한다. 둘 다 우리가 그린
 * 게 아니라 Iconify CDN에서 그대로 받아온다. */
const POSE_BASE_ICON = 'solar:sleeping-bold';
const POSE_BADGE_ICON: Record<string, string> = {
  left: 'tabler:arrow-left',
  right: 'tabler:arrow-right',
  facedown: 'tabler:arrow-down',
  curled: 'tabler:arrows-diagonal-minimize-2',
  propped: 'tabler:arrow-up',
};

function PoseIllustration({ id, color, badgeColor }: { id: string; color: string; badgeColor: string }) {
  if (id === 'unknown') {
    return <SvgUri color={color} height={30} uri="https://api.iconify.design/tabler:help-circle.svg" width={30} />;
  }
  const badge = POSE_BADGE_ICON[id];
  return (
    <View style={s.poseIllustration}>
      <SvgUri color={color} height={34} uri={`https://api.iconify.design/${POSE_BASE_ICON}.svg`} width={34} />
      {badge ? (
        <View style={[s.poseBadge, { backgroundColor: badgeColor }]}>
          <SvgUri color="#fff" height={11} uri={`https://api.iconify.design/${badge}.svg`} width={11} />
        </View>
      ) : null}
    </View>
  );
}

function StepSleep() {
  const c = usePalette();
  const { draft, updateDraft } = useDailyCheck();
  const sleepMin = resolvedSleepMin(draft.hk, draft.hkManual, draft.hkAuto);

  return (
    <>
      <View style={[s.sleepSummary, { backgroundColor: c.g100 }]}>
        <Text style={[text({ size: 11.5, weight: 700 }), { color: c.g500 }]}>수면 시간</Text>
        <Text style={[text({ size: 28, weight: 700, tracking: -0.05, tabular: true }), s.sleepSummaryValue, { color: c.g900 }]}>{fmtSleep(sleepMin)}</Text>
        <Text style={[text({ size: 11.5, leading: 1.6 }), s.sleepSummaryNote, { color: c.g500 }]}>1단계에서 가져온 값이에요. 다르면 그 단계로 돌아가 고쳐주세요.</Text>
      </View>

      <Text style={[text({ size: 13.5, weight: 700 }), s.blockLabel26, { color: c.g700 }]}>잠자리 만족도</Text>
      <View style={s.qualityRow}>
        {SLEEP_QUALITY_LABELS.map((l, i) => {
          const sel = draft.sleepQ === i;
          return (
            <Pressable key={l} accessibilityRole="button" accessibilityState={{ selected: sel }} onPress={() => updateDraft({ sleepQ: i })} style={[s.qualityBtn, { borderColor: sel ? c.pri : c.g200, backgroundColor: sel ? c.priLightest : c.card }]}>
              <Text style={[text({ size: 13.5, weight: 700 }), { color: sel ? c.priDk : c.g600 }]}>{l}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[text({ size: 13.5, weight: 700 }), s.blockLabel26, { color: c.g700 }]}>주로 어떤 자세로 잤나요?</Text>
      <View style={s.poseGrid}>
        {SLEEP_POSES.map((p) => {
          const on = draft.pose === p.id;
          return (
            <Pressable key={p.id} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => updateDraft({ pose: p.id })} style={[s.poseBtn, { borderColor: on ? c.pri : c.g200, backgroundColor: on ? c.priLightest : 'transparent' }]}>
              <View style={s.poseIconSlot}><PoseIllustration badgeColor={on ? c.priDk : c.g400} color={on ? c.priDk : c.g500} id={p.id} /></View>
              <Text style={[text({ size: 11.5, weight: on ? 700 : 500 }), { color: on ? c.priDk : c.g600 }]}>{p.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={s.pillowHead}>
        <Text style={[text({ size: 13.5, weight: 700 }), { color: c.g700 }]}>베개 높이</Text>
        <Text style={[text({ size: 12, weight: 600 }), { color: c.g500 }]}>{draft.pillow !== null ? PILLOW_LABELS[draft.pillow] : ''}</Text>
      </View>
      <View style={s.pillowRow}>
        {PILLOW_LABELS.map((l, i) => {
          const on = draft.pillow === i;
          return (
            <Pressable key={l} accessibilityLabel={l} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => updateDraft({ pillow: i })} style={s.pillowBtn}>
              <View style={s.pillowIconSlot}>
                <SvgUri color={on ? c.pri : c.g400} height={22 + i * 8} uri="https://api.iconify.design/tabler:pillow.svg" width={22 + i * 8} />
              </View>
              <Text style={[text({ size: 11.5, weight: on ? 700 : 500 }), { color: on ? c.priDk : c.g500 }]}>{l}</Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

/* ── 4단계 — 활동·피부 ────────────────────────────────────── */

function StepActivitySkin() {
  const c = usePalette();
  const { draft, updateDraft, toggleSkin, toggleSpot, addPhoto, retryPhoto, removePhoto } = useDailyCheck();

  return (
    <>
      <View style={s.sitHead}>
        <Text style={[text({ size: 13.5, weight: 700 }), { color: c.g700 }]}>오래 앉아 있던 시간</Text>
        <Text style={[text({ size: 13, weight: 700, tabular: true }), { color: c.g900 }]}>{draft.sit !== null ? SIT_LABELS_LONG[draft.sit] : ''}</Text>
      </View>
      <View style={s.sitRow}>
        {SIT_LABELS_SHORT.map((l, i) => {
          const sel = draft.sit === i;
          return (
            <Pressable key={l} accessibilityRole="button" accessibilityState={{ selected: sel }} onPress={() => updateDraft({ sit: i })} style={[s.sitBtn, { borderColor: sel ? c.g900 : c.g200, backgroundColor: sel ? c.g900 : 'transparent' }]}>
              <Text style={[text({ size: 12, weight: 700 }), { color: sel ? c.card : c.g500 }]}>{l}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[text({ size: 13.5, weight: 700 }), s.blockLabel26, { color: c.g700 }]}>피부 상태 · 여러 개 선택 가능</Text>
      <View style={s.skinGrid}>
        {SKIN_STATES.map((l) => {
          const sel = draft.skin.includes(l);
          return (
            <Pressable key={l} accessibilityRole="button" accessibilityState={{ selected: sel }} onPress={() => toggleSkin(l)} style={[s.skinBtn, { borderColor: sel ? c.pri : c.g200, backgroundColor: sel ? c.priLightest : 'transparent' }]}>
              <Text style={[text({ size: 12.5, weight: sel ? 700 : 500 }), { color: sel ? c.priDk : c.g600 }]}>{l}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[s.toggleRow, s.troubleCard, { borderColor: c.g200 }]}>
        <View style={s.toggleRowInner}>
          <View style={s.flex1}>
            <Text style={[text({ size: 14.5, weight: 700, tracking: -0.03 }), { color: c.g900 }]}>트러블이 있었나요?</Text>
            <Text style={[text({ size: 11.5 }), s.toggleSub, { color: c.g500 }]}>부위와 사진을 함께 남길 수 있어요</Text>
          </View>
          <ToggleSwitch c={c} label="트러블 여부" on={draft.trouble} onToggle={() => updateDraft({ trouble: !draft.trouble })} />
        </View>

        {draft.trouble ? (
          <View style={[s.troubleOpen, { borderTopColor: c.g200 }]}>
            <Text style={[text({ size: 11.5, weight: 700 }), { color: c.g500 }]}>부위</Text>
            <View style={s.spotRow}>
              {TROUBLE_SPOTS.map((l) => {
                const on = draft.spots.includes(l);
                return (
                  <Pressable key={l} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => toggleSpot(l)} style={[s.spotChip, { borderColor: on ? c.danger : c.g200, backgroundColor: on ? c.dangerBg : 'transparent' }]}>
                    <Text style={[text({ size: 12, weight: on ? 700 : 500 }), { color: on ? c.dangerDk : c.g600 }]}>{l}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[text({ size: 11.5, weight: 700 }), s.photoLabel, { color: c.g500 }]}>사진</Text>
            <View style={s.photoRow}>
              <Pressable accessibilityRole="button" onPress={addPhoto} style={[s.photoAdd, { borderColor: c.g300, backgroundColor: c.g100 }]}>
                <CameraGlyph color={c.g500} />
                <Text style={[text({ size: 10, weight: 700 }), { color: c.g500 }]}>추가</Text>
              </Pressable>
              {draft.photos.map((p) => <PhotoThumb key={p.id} onRemove={() => removePhoto(p.id)} onRetry={() => retryPhoto(p.id)} photo={p} />)}
            </View>
          </View>
        ) : null}
      </View>

      <View style={s.memoHead}>
        <Text style={[text({ size: 13.5, weight: 700 }), { color: c.g700 }]}>메모 (선택)</Text>
        <Text style={[text({ size: 11.5 }), { color: c.g400 }]}>{draft.memo.length}/150</Text>
      </View>
      <TextInput
        maxLength={150}
        multiline
        onChangeText={(memo) => updateDraft({ memo })}
        placeholder="오늘 몸에 대해 남기고 싶은 말이 있다면 적어주세요"
        placeholderTextColor={c.g400}
        style={[s.memoInput, { borderColor: c.g300, color: c.g900 }]}
        value={draft.memo}
      />
    </>
  );
}

function PhotoThumb({ photo, onRetry, onRemove }: { photo: CheckPhoto; onRetry: () => void; onRemove: () => void }) {
  const c = usePalette();
  return (
    <View style={[s.photoThumb, { backgroundColor: c.g200 }]}> 
      <Image accessibilityIgnoresInvertColors resizeMode="cover" source={{ uri: photo.uri }} style={s.photoFill} />
      {photo.status === 'up' ? (
        <View style={s.photoOverlay}>
          <Text style={[text({ size: 11, weight: 700, tabular: true }), { color: '#fff' }]}>{photo.pct}%</Text>
          <View style={s.photoBarTrack}><View style={[s.photoBarFill, { width: `${photo.pct}%` }]} /></View>
        </View>
      ) : null}
      {photo.status === 'fail' ? (
        <Pressable accessibilityRole="button" onPress={onRetry} style={s.photoFail}>
          <RetryGlyph color="#fff" />
          <Text style={[text({ size: 9.5, weight: 700 }), { color: '#fff' }]}>재시도</Text>
        </Pressable>
      ) : null}
      {photo.status === 'done' ? (
        <Pressable accessibilityLabel="사진 삭제" accessibilityRole="button" onPress={onRemove} style={s.photoRemove}>
          <SmallCloseGlyph color="#fff" />
        </Pressable>
      ) : null}
    </View>
  );
}

/* ── 5단계 — 검토 ─────────────────────────────────────────── */

function StepReview({ onEdit }: { onEdit: (step: number) => void }) {
  const c = usePalette();
  const { draft } = useDailyCheck();
  const hkRows = hkRowsFor(draft.hk, draft.hkManual, draft.hkAuto);
  const stepsWalk = hkRows.find((r) => r.key === '걸음 수')?.value ?? '입력 안 함';

  const groups: { key: string; title: string; icon: 'health' | 'ache' | 'sleep' | 'skin'; tone?: boolean; step: number; rows: { k: string; v: string; tone?: boolean }[] }[] = [
    { key: 'auto', title: '오늘의 시작', icon: 'health', step: 0, rows: [
      { k: '수면 시간', v: fmtSleep(resolvedSleepMin(draft.hk, draft.hkManual, draft.hkAuto)) }, { k: '걸음 수', v: stepsWalk },
      { k: '컨디션', v: draft.condition ? CONDITION_OPTIONS.find((o) => o.id === draft.condition)?.label ?? '입력 안 함' : '입력 안 함' },
      { k: '해당 상태', v: draft.conditionTags.length ? draft.conditionTags.join(', ') : '없음' },
    ] },
    { key: 'ache', title: '불편', icon: 'ache', tone: true, step: 1, rows: draft.parts.length ? [
      { k: '부위', v: draft.parts.map((p) => ZONE_LABELS[p] ?? p).join(', '), tone: true },
      { k: '강도', v: draft.parts.map((p) => `${draft.levels[p] ?? 2}단계`).join(' · '), tone: true },
      { k: '느낌', v: draft.parts.map((p) => (draft.feels[p]?.length ? draft.feels[p].join('·') : '입력 안 함')).join(' / ') },
      { k: '두통', v: draft.headache ? '있음' : '없음' },
    ] : [{ k: '부위', v: '없음' }] },
    { key: 'sleep', title: '수면', icon: 'sleep', step: 2, rows: [
      { k: '만족도', v: draft.sleepQ !== null ? SLEEP_QUALITY_LABELS[draft.sleepQ] : '입력 안 함' },
      { k: '자세', v: draft.pose ? SLEEP_POSES.find((p) => p.id === draft.pose)?.label ?? '입력 안 함' : '입력 안 함' },
      { k: '베개 높이', v: draft.pillow !== null ? PILLOW_LABELS[draft.pillow] : '입력 안 함' },
    ] },
    { key: 'act', title: '활동·피부', icon: 'skin', step: 3, rows: [
      { k: '앉아 있던 시간', v: draft.sit !== null ? SIT_LABELS_LONG[draft.sit] : '입력 안 함' },
      { k: '피부', v: draft.skin.length ? draft.skin.join(', ') : '입력 안 함' },
      { k: '트러블', v: draft.trouble ? `${draft.spots.length ? draft.spots.join('·') : '부위 입력 안 함'} · 사진 ${draft.photos.filter((p) => p.status === 'done').length}장` : '없음' },
    ] },
  ];

  return (
    <>
      <View style={s.reviewList}>
        {groups.map((g) => (
          <View key={g.key} style={[s.reviewGroup, { borderColor: c.g200 }]}>
            <View style={s.reviewHead}>
              <View style={s.reviewHeadLeft}>
                <View style={[s.reviewIconWrap, { backgroundColor: g.tone ? c.dangerBg : c.priLightest }]}>
                  <HkGlyph color={g.tone ? c.dangerDk : c.priDk} id={g.icon} size={15} />
                </View>
                <Text style={[text({ size: 14.5, weight: 700 }), { color: c.g900 }]}>{g.title}</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => onEdit(g.step)} style={[s.reviewEditBtn, { borderColor: c.g300 }]}>
                <Text style={[text({ size: 12, weight: 700 }), { color: c.g700 }]}>수정</Text>
              </Pressable>
            </View>
            {g.rows.map((r) => (
              <View key={r.k} style={[s.reviewRow, { borderTopColor: c.g200 }]}>
                <Text style={[text({ size: 13 }), s.reviewRowKey, { color: c.g600 }]}>{r.k}</Text>
                <Text style={[text({ size: 13.5, weight: 700 }), s.flex1, { color: r.v === '입력 안 함' || r.v === '부위 입력 안 함' ? c.g400 : r.tone ? c.danger : c.g900, textAlign: 'right' }]}>{r.v}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
      <View style={[s.reviewNote, { backgroundColor: c.g100 }]}>
        <Text style={[text({ size: 12, leading: 1.7 }), { color: c.g600 }]}>미입력 항목이 있어도 저장할 수 있어요. 나중에 이 날짜를 열어 이어서 채울 수 있습니다.</Text>
      </View>
    </>
  );
}

/** box-shadow:0 0 0 5px rgba(danger,.09) — 웹은 정확히, iOS 는 근사치. */
function glow(color: string): ViewStyle {
  return {
    boxShadow: `0 0 0 5px ${hexA(color, 0.09)}`,
    shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.09, shadowRadius: 5,
  } as ViewStyle;
}
function hexA(hex: string, a: number) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

const s = StyleSheet.create({
  flex1: { flex: 1, minWidth: 0 },

  conditionRow: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  conditionBtn: { minHeight: 46, paddingHorizontal: 16, borderWidth: 1.5, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },

  hkRows: { marginTop: 24, gap: 10 },
  hkCard: { padding: 16, borderWidth: 1, borderRadius: 16 },
  hkCardRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  hkIconWrap: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  hkSrc: { marginTop: 3 },
  hkSkeleton: { width: 52, height: 20, borderRadius: 6 },
  hkActions: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, flexDirection: 'row', gap: 7 },
  hkActionBtn: { flex: 1, minHeight: 38, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  hkNote: { marginTop: 14, padding: 14, paddingHorizontal: 15, borderRadius: 14 },

  bodyViewRow: { marginTop: 20, flexDirection: 'row', gap: 7 },
  bodyViewPill: { minHeight: 38, paddingHorizontal: 18, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  mapWrap: { marginTop: 16, paddingVertical: 12, borderRadius: 20, alignItems: 'center' },
  mapInner: { width: 212, height: 328, position: 'relative' },
  zoneBtn: { position: 'absolute', borderRadius: 16 },
  mapCaption: { marginTop: 10, textAlign: 'center' },
  chipRow: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  zoneChip: { height: 34, paddingLeft: 13, paddingRight: 8, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 5 },
  zoneChipRemove: { width: 18, height: 18, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  blockLabel26: { marginTop: 26 },

  partFormList: { marginTop: 14, gap: 14 },
  partForm: { padding: 16, borderWidth: 1, borderRadius: 16 },
  partFormHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  partDot: { width: 8, height: 8, borderRadius: 5 },
  partFormSubLabel: { marginTop: 16 },
  partFormSubLabel2: { marginTop: 16 },
  levelRow: { marginTop: 8, flexDirection: 'row', gap: 6 },
  levelBtn: { flex: 1, minHeight: 46, borderWidth: 1.5, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  feelRow: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  feelChip: { minHeight: 40, paddingHorizontal: 15, borderWidth: 1.5, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },

  toggleRow: { marginTop: 16, padding: 16, paddingVertical: 14, borderWidth: 1.5, borderRadius: 18 },
  toggleRowInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  toggleSub: { marginTop: 3 },
  headacheRow: { marginTop: 10, flexDirection: 'row', gap: 8 },
  headachePill: { flex: 1, minHeight: 46, paddingHorizontal: 16, borderWidth: 1.5, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  switchTrack: { width: 52, height: 32, borderRadius: 17 },
  switchKnob: { position: 'absolute', top: 3, width: 26, height: 26, borderRadius: 14, backgroundColor: '#fff' },

  sleepSummary: { marginTop: 4, padding: 18, borderRadius: 20, alignItems: 'center' },
  sleepSummaryValue: { marginTop: 6 },
  sleepSummaryNote: { marginTop: 8, textAlign: 'center' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(22,25,29,.5)', alignItems: 'center', justifyContent: 'center', padding: 28 },
  modalCard: { width: '100%', maxWidth: 340, padding: 22, borderRadius: 24 },
  manualInput: { marginTop: 16, height: 50, paddingHorizontal: 16, borderWidth: 1, borderRadius: 14, fontSize: 15 },
  manualSleepRow: { flexDirection: 'row', gap: 10 },
  manualSleepField: { flex: 1 },
  manualUnit: { marginTop: 6, textAlign: 'center' },
  modalBtnRow: { marginTop: 18, flexDirection: 'row', gap: 8 },
  modalBtn: { flex: 1, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  qualityRow: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  qualityBtn: { minHeight: 48, paddingHorizontal: 16, borderWidth: 1.5, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  poseGrid: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  poseBtn: { width: '23.5%', paddingTop: 9, paddingHorizontal: 4, paddingBottom: 10, borderWidth: 1.5, borderRadius: 16, alignItems: 'center', gap: 3 },
  poseIconSlot: { height: 44, alignItems: 'center', justifyContent: 'center' },
  poseIllustration: { width: 34, height: 34 },
  poseBadge: { position: 'absolute', right: -4, bottom: -4, width: 18, height: 18, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pillowHead: { marginTop: 26, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  pillowRow: { marginTop: 12, flexDirection: 'row', alignItems: 'flex-end', gap: 7 },
  pillowBtn: { flex: 1, alignItems: 'center', gap: 8 },
  pillowIconSlot: { height: 46, alignItems: 'center', justifyContent: 'flex-end' },

  sitHead: { marginTop: 22, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sitRow: { marginTop: 10, flexDirection: 'row', gap: 6 },
  sitBtn: { flex: 1, minHeight: 44, borderWidth: 1.5, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  skinGrid: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  skinBtn: { width: '23.5%', minHeight: 44, borderWidth: 1.5, borderRadius: 23, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  troubleCard: { marginTop: 20 },
  troubleOpen: { marginTop: 14, paddingTop: 14, borderTopWidth: 1 },
  spotRow: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  spotChip: { minHeight: 36, paddingHorizontal: 13, borderWidth: 1.5, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  photoLabel: { marginTop: 16 },
  photoRow: { marginTop: 8, flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  photoAdd: { width: 76, height: 76, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoThumb: { width: 76, height: 76, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  photoFill: { ...StyleSheet.absoluteFillObject },
  photoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(22,25,29,.5)', alignItems: 'center', justifyContent: 'center', gap: 5 },
  photoBarTrack: { width: 44, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,.35)', overflow: 'hidden' },
  photoBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 2 },
  photoFail: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(217,31,31,.82)', alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoRemove: { position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: 12, backgroundColor: 'rgba(22,25,29,.62)', alignItems: 'center', justifyContent: 'center' },
  memoHead: { marginTop: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  memoInput: { marginTop: 10, minHeight: 104, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderRadius: 16, fontSize: 14, lineHeight: 23.8 },

  reviewList: { marginTop: 22, gap: 16 },
  reviewGroup: { paddingTop: 4, paddingHorizontal: 16, paddingBottom: 6, borderWidth: 1, borderRadius: 16 },
  reviewHead: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewIconWrap: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  reviewEditBtn: { minHeight: 32, paddingHorizontal: 12, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  reviewRow: { minHeight: 46, paddingVertical: 6, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, borderTopWidth: 1 },
  reviewRowKey: { flexShrink: 0 },
  reviewNote: { marginTop: 16, padding: 14, paddingHorizontal: 16, borderRadius: 16 },
});
