import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Image, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CHEKI } from '@/lib/cheki';
import { BodyMap } from '@/components/body-map';
import { BrandHeaderLogo } from '@/components/brand-logo';
import { AnimatedProgressFill } from '@/components/ui/animated-progress-fill';
import {
  ArrowRightGlyph, BellGlyph, ChatGlyph, ChevronGlyph, ChevronSmallGlyph, CloseGlyph,
  MoodGlyph, PlayGlyph, RoutineFigureGlyph, WarningGlyph,
} from '@/components/glyphs';
import { useDailyCheck } from '@/context/daily-check-context';
import { useNotifications } from '@/context/notifications-context';
import { headerShadow, useScrollElevation } from '@/hooks/use-scroll-header';
import { useStretchList } from '@/hooks/use-stretch-map';
import { toCurrentKoreanDateLabel } from '@/utils/date';
import { pickStretchFor } from '@/services/exercise-gifs-api';
import { wellnessApi } from '@/services/wellness-api';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import type { Palette } from '@/theme/palette';
import { EMPTY_HOME_VIEW, loadHomeView, WEEK_LABELS, type HomeState, type HomeView } from './home.data';

/**
 * `Momgirok v8.dc.html` → `<sc-if value="{{ isHome }}">` 블록을 그대로 옮긴 것.
 * `state`/`view`를 넘기면(dev 전용 `?state=` 오버라이드) 그 값을 그대로 쓰고,
 * 넘기지 않으면 백엔드에서 조합한 실제 데이터를 불러온다.
 */

export default function HomeScreen({ state: stateOverride, view: viewOverride }: { state?: HomeState; view?: HomeView }) {
  const c = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();
  const { updateDraft } = useDailyCheck();
  const [refreshing, setRefreshing] = useState(false);
  const { elevated, onScroll } = useScrollElevation();
  const [partSheet, setPartSheet] = useState<HomeView['parts'][number] | null>(null);
  const [healthValues, setHealthValues] = useState<{ sleep: string; steps: string; source: string }>({ sleep: '불러오는 중…', steps: '불러오는 중…', source: '건강 데이터' });
  const [loadedView, setLoadedView] = useState<HomeView>(EMPTY_HOME_VIEW);
  const [loadedState, setLoadedState] = useState<HomeState>('empty');
  const [loading, setLoading] = useState(true);

  const reloadHome = useCallback(async () => {
    try {
      const { view: nextView, state: nextState } = await loadHomeView();
      setLoadedView(nextView);
      setLoadedState(nextState);
    } catch {
      setLoadedView(EMPTY_HOME_VIEW);
      setLoadedState('empty');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reloadHome(); }, [reloadHome]);

  const view = viewOverride ?? loadedView;
  const state = stateOverride ?? loadedState;

  useEffect(() => {
    let active = true;
    void wellnessApi.getAutoHealthRecord().then((record) => {
      if (active) setHealthValues({ sleep: record.sleepDuration, steps: record.steps, source: record.source === 'apple-health' ? 'Apple 건강' : 'Health Connect' });
    }).catch((error) => {
      if (!active) return;
      const message = error instanceof Error ? error.message : '';
      const value = /연결되지/.test(message) ? '연결 필요' : '기록 없음';
      setHealthValues({ sleep: value, steps: value, source: '건강 데이터' });
    });
    return () => { active = false; };
  }, []);

  const facts = useMemo(() => view.facts.map((fact) => fact.key === 'a'
    ? { ...fact, value: healthValues.sleep, source: healthValues.source }
    : fact.key === 'b'
      ? { ...fact, value: healthValues.steps, source: healthValues.source }
      : fact), [healthValues, view.facts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await reloadHome();
    setRefreshing(false);
  };

  const openPart = () => {
    // "오늘의 몸" 요약은 시연 데이터라 daily-check 초안과 따로 논다 — 탭했을 때
    // 빈 상태로 보이지 않도록, 요약에 적힌 강도·느낌을 초안에 옮겨 심고 들어간다.
    const levels: Record<string, number> = {};
    const feels: Record<string, string[]> = {};
    for (const p of view.parts) {
      const level = Number(p.meta.match(/(\d)단계/)?.[1]);
      const feel = p.meta.split('·').pop()?.trim();
      if (level) levels[p.id] = level;
      if (feel) feels[p.id] = [feel];
    }
    updateDraft({ parts: view.parts.map((p) => p.id), levels, feels });
    router.push('/check/discomfort');
  };

  const recorded = state !== 'empty';
  const gateLocked = view.gateDays < 30;
  const todayLabel = toCurrentKoreanDateLabel();

  return (
    <View style={[s.screen, { backgroundColor: c.bg }]}>
      {/* 헤더 — height:52; padding:0 12px 0 20px */}
      <View style={[s.headerSurface, { backgroundColor: c.card, borderBottomColor: c.g200, paddingTop: insets.top }, elevated && headerShadow]}>
        <View style={[s.header]}>
          <BrandHeaderLogo />
          <View style={s.headerActions}>
            <Pressable accessibilityRole="button" accessibilityLabel="웰니스 챗" onPress={() => router.push('/assistant')} style={s.iconBtn}>
              <ChatGlyph color={c.g800} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`알림 ${unreadCount}개`} onPress={() => router.push('/notifications')} style={s.iconBtn}>
              <BellGlyph color={c.g800} />
              {unreadCount > 0 ? (
                <View style={[s.badge, { backgroundColor: c.danger, borderColor: c.card }]}>
                  <Text style={[text({ size: 9.5, weight: 700 }), { color: '#fff' }]}>{unreadCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>
      </View>

      {loading && !viewOverride ? (
        <View style={s.loadingWrap}><ActivityIndicator color={c.pri} /></View>
      ) : (
      <ScrollView
        onScroll={onScroll}
        refreshControl={<RefreshControl onRefresh={() => void onRefresh()} refreshing={refreshing} tintColor={c.pri} />}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={s.body}>

      {state === 'syncing' && <SyncingBanner c={c} />}
      {state === 'error' && <ErrorBanner c={c} onRetry={() => void reloadHome()} onManual={() => router.push('/check/auto')} />}

      <View style={[s.dateBar, { backgroundColor: c.bg, borderBottomColor: c.g200 }]}>
        <Text style={[text({ size: 12, weight: 600 }), { color: c.g500 }]}>{todayLabel}</Text>
      </View>

      {state === 'empty'
        ? <EmptyHero c={c} onStart={() => router.push('/check/auto')} streakDaysBeforeToday={view.streakDaysBeforeToday} />
        : <>
            <WeekSection c={c} week={view.week} />
            <TodayBodySection c={c} facts={facts} onEdit={() => router.push('/check/auto')} onOpenPart={setPartSheet} parts={view.parts} />
          </>}

      <ChangesSection c={c} gateDays={view.gateDays} locked={gateLocked} onOpen={() => router.navigate('/(tabs)/discover')} />
      <RoutineSection c={c} onStart={() => router.push('/routine')} routine={view.routine} />
      {recorded && <RecentSection c={c} onOpen={() => router.navigate('/(tabs)/records')} recent={view.recent} />}

      {/* 탭바에 가리지 않기 위한 여백 — <div style="height:112px"> */}
      <View style={{ height: 112 }} />
      </ScrollView>
      )}

      <PartDetailSheet
        c={c}
        onClose={() => setPartSheet(null)}
        onEdit={() => { setPartSheet(null); openPart(); }}
        onViewRoutine={() => { setPartSheet(null); router.push('/routine'); }}
        part={partSheet}
      />
    </View>
  );
}

/* ── 동기화 중 ─────────────────────────────────────────────── */

function SyncingBanner({ c }: { c: Palette }) {
  return (
    <View style={[s.bannerWrap, { backgroundColor: c.card }]}>
      <View style={[s.syncBanner, { backgroundColor: c.g100 }]}>
        <View style={[s.syncDot, { backgroundColor: c.pri }]} />
        <Text style={[text({ size: 12.5, weight: 600 }), s.flex1, { color: c.g700 }]}>
          Apple 건강에서 어젯밤 데이터를 가져오는 중
        </Text>
      </View>
    </View>
  );
}

/* ── 동기화 오류 ───────────────────────────────────────────── */

function ErrorBanner({ c, onRetry, onManual }: { c: Palette; onRetry: () => void; onManual: () => void }) {
  return (
    <View style={[s.bannerWrap, { backgroundColor: c.card }]}>
      <View style={[s.errCard, { backgroundColor: c.dangerBg }]}>
        <View style={s.errRow}>
          <View style={[s.errIcon, { backgroundColor: c.card }]}><WarningGlyph color={c.dangerDk} /></View>
          <View style={s.flex1}>
            <Text style={[text({ size: 14, weight: 700, tracking: -0.03 }), { color: c.g900 }]}>건강 데이터를 가져오지 못했어요</Text>
            <Text style={[text({ size: 12.5, leading: 1.65 }), s.errBody, { color: c.g600 }]}>
              Apple 건강 동기화가 끊겼어요. 직접 입력해도 오늘 기록은 정상 저장됩니다.
            </Text>
            <View style={s.errActions}>
              <Pressable accessibilityRole="button" onPress={onRetry} style={[s.errBtn, { backgroundColor: c.g900 }]}>
                <Text style={[text({ size: 12.5, weight: 700 }), { color: c.card }]}>다시 시도</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={onManual} style={[s.errBtn, s.errBtnGhost]}>
                <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g700 }]}>직접 입력</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ── 기록 전 히어로 ────────────────────────────────────────── */

function EmptyHero({ c, onStart, streakDaysBeforeToday }: { c: Palette; onStart: () => void; streakDaysBeforeToday: number }) {
  const caption = streakDaysBeforeToday > 0 ? `3분이면 끝나요 · 어제까지 ${streakDaysBeforeToday}일 연속` : '3분이면 끝나요';
  return (
    <View style={[s.emptySection, { backgroundColor: c.card }]}>
      <View style={[s.emptyHero, { backgroundColor: c.pri }]}>
        <Text style={[text({ size: 12, weight: 700 }), { color: '#3A5209' }]}>오늘의 기록</Text>
        <Text style={[text({ size: 25, weight: 700, tracking: -0.045, leading: 1.4 }), s.emptyTitle, { color: '#1E2D05' }]}>
          오늘 몸 상태를{'\n'}아직 남기지 않았어요
        </Text>
        <View style={s.emptyMap}>
          <Image accessible={false} resizeMode="contain" source={CHEKI.welcome} style={s.emptyMascot} />
        </View>
        <Pressable accessibilityRole="button" onPress={onStart} style={({ pressed }) => [s.emptyCta, pressed && s.pressed]}>
          <Text style={[text({ size: 16, weight: 700, tracking: -0.025 }), { color: '#fff' }]}>오늘 기록하기</Text>
          <ArrowRightGlyph color="#fff" />
        </Pressable>
        <Text style={[text({ size: 12, weight: 600 }), s.emptyCaption, { color: '#3A5209' }]}>{caption}</Text>
      </View>
    </View>
  );
}

/* ── 이번 주 기록 ──────────────────────────────────────────── */

function WeekSection({ c, week }: { c: Palette; week: HomeView['week'] }) {
  return (
    <View style={[s.weekSection, { backgroundColor: c.card }]}>
      <View style={s.weekRow}>
        <Image accessible={false} resizeMode="contain" source={CHEKI.base} style={s.weekMascot} />
        <View style={s.flex1}>
      <View style={s.rowBetween}>
        <Text style={[text({ size: 12, weight: 700 }), { color: c.g600 }]}>이번 주 기록</Text>
        <Text style={[text({ size: 12, weight: 700 }), { color: c.pri }]}>{week.recorded} / {week.total}일</Text>
      </View>

      {/* margin-top:44 은 위로 뻗는 숫자 pill(top:-38) 자리를 비워 둔 값이다 */}
      <View style={s.progressWrap}>
        <View style={[s.progressTrack, { backgroundColor: c.g200 }]} />
        <AnimatedProgressFill progress={week.percent / 100} style={[s.progressFill, { backgroundColor: c.pri }]} />
        {WEEK_LABELS.map((_, i) => (
          <View
            key={i}
            style={[
              s.weekDot,
              { left: `${(i / 6) * 100}%`, backgroundColor: week.recordedByDay[i] ? 'rgba(255,255,255,.75)' : c.g300 },
            ]}
          />
        ))}
        <View style={[s.pillAnchor, { left: `${week.percent}%` }]}>
          <View style={[s.pill, { backgroundColor: c.g900 }]}>
            <Text style={[text({ size: 12.5, weight: 700, tracking: -0.02 }), { color: c.card }]} numberOfLines={1}>
              {week.pillLabel}
            </Text>
          </View>
          <View style={[s.pillConnector, { backgroundColor: c.g900 }]} />
        </View>
      </View>

      <View style={s.weekLabels}>
        {WEEK_LABELS.map((d, i) => (
          <Text
            key={d}
            style={[
              text({ size: 11, weight: i === week.todayIndex ? 700 : 500 }),
              { color: i <= week.todayIndex ? c.g700 : c.g400 },
            ]}>
            {d}
          </Text>
        ))}
      </View>
        </View>
      </View>
    </View>
  );
}

/* ── 오늘의 몸 ─────────────────────────────────────────────── */

function TodayBodySection({ c, parts, facts, onEdit, onOpenPart }: { c: Palette; parts: HomeView['parts']; facts: HomeView['facts']; onEdit: () => void; onOpenPart: (part: HomeView['parts'][number]) => void }) {
  return (
    <View style={[s.section, s.sectionTight, { backgroundColor: c.card }]}>
      <View style={s.rowBetween}>
        <Text style={[text({ size: 18, weight: 700, tracking: -0.035 }), { color: c.g900 }]}>오늘의 몸</Text>
        <Pressable accessibilityRole="button" onPress={onEdit} style={[s.editPill, { borderColor: c.g300, backgroundColor: c.card }]}>
          <Text style={[text({ size: 12, weight: 700 }), { color: c.g700 }]}>수정</Text>
        </Pressable>
      </View>

      <View style={s.bodyRow}>
        <View style={s.bodyMapSlot}>
          <BodyMap height={145} label="앞모습 신체 도형, 양쪽 어깨에 불편 표시" marks={parts.map((p) => p.id)} width={94} />
        </View>
        <View style={s.bodyList}>
          {parts.map((p) => (
            <Pressable accessibilityLabel={`${p.name}, ${p.meta}, 상세 보기`} accessibilityRole="button" key={p.id} onPress={() => onOpenPart(p)} style={s.partRow}>
              <View style={[s.partDot, { backgroundColor: c.danger }]} />
              <View style={s.flex1}>
                <Text numberOfLines={1} style={[text({ size: 14.5, weight: 700, tracking: -0.03 }), { color: c.g900 }]}>{p.name}</Text>
                <Text style={[text({ size: 11.5 }), s.partMeta, { color: c.g500 }]}>{p.meta}</Text>
              </View>
              <ChevronGlyph color={c.g400} />
            </Pressable>
          ))}
          <Text style={[text({ size: 11, leading: 1.55 }), { color: c.g400 }]}>부위를 눌러 최근 추이를 확인하세요</Text>
        </View>
      </View>

      <View style={[s.facts, { borderTopColor: c.g200 }]}>
        {facts.map((f, i) => (
          <View key={f.key} style={[s.fact, i < 2 && { borderRightWidth: 1, borderRightColor: c.g200 }, { paddingLeft: i ? 12 : 0 }]}>
            <Text style={[text({ size: 11, weight: 600 }), { color: c.g500 }]}>{f.label}</Text>
            <Text numberOfLines={1} style={[text({ size: 15, weight: 700, tracking: -0.035, tabular: true }), s.factValue, { color: f.tone ? c.danger : c.g900 }]}>
              {f.value}
            </Text>
            <Text style={[text({ size: 10, weight: 600 }), s.factSource, { color: c.g400 }]}>{f.source}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ── 부위 상세 시트 ────────────────────────────────────────── */

const TREND_DAY_LABELS = ['D-3', 'D-2', 'D-1', '오늘'];

/** "수정"(상단 pill)은 바로 편집 화면으로 이동하지만, 부위 행을 누르면 최근 추이를 먼저
 * 보여주는 상세 시트가 뜬다 — 편집은 시트 안의 별도 버튼으로만 들어간다. */
function PartDetailSheet({
  c, part, onClose, onEdit, onViewRoutine,
}: {
  c: Palette; part: HomeView['parts'][number] | null;
  onClose: () => void; onEdit: () => void; onViewRoutine: () => void;
}) {
  const maxTrend = Math.max(1, ...(part?.trend ?? [1]));
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={part !== null}>
      <Pressable accessibilityLabel="닫기" accessibilityRole="button" onPress={onClose} style={s.sheetBackdrop}>
        <Pressable onPress={(e) => e.stopPropagation()} style={[s.sheetCard, { backgroundColor: c.card }]}>
          {part ? (
            <>
              <View style={s.sheetHead}>
                <Text style={[text({ size: 17, weight: 700, tracking: -0.035 }), { color: c.g900 }]}>{part.name}</Text>
                <Pressable accessibilityLabel="닫기" accessibilityRole="button" onPress={onClose} style={s.sheetCloseBtn}>
                  <CloseGlyph color={c.g600} size={17} />
                </Pressable>
              </View>
              <Text style={[text({ size: 12.5, weight: 600 }), s.sheetMeta, { color: c.g500 }]}>{part.meta}</Text>

              <Text style={[text({ size: 11.5, weight: 700 }), s.sheetTrendLabel, { color: c.g500 }]}>최근 강도 추이</Text>
              <View style={[s.trendRow, { borderColor: c.g200 }]}>
                {part.trend.map((v, i) => (
                  <View key={i} style={s.trendCol}>
                    <View style={s.trendBarTrack}>
                      <View style={[s.trendBar, { height: v ? `${(v / maxTrend) * 100}%` : 3, backgroundColor: i === part.trend.length - 1 ? c.danger : c.g300 }]} />
                    </View>
                    <Text style={[text({ size: 10.5, weight: i === part.trend.length - 1 ? 700 : 500 }), { color: i === part.trend.length - 1 ? c.g900 : c.g400 }]}>
                      {TREND_DAY_LABELS[i] ?? i}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={s.sheetBtnRow}>
                <Pressable accessibilityRole="button" onPress={onViewRoutine} style={[s.sheetBtn, { borderWidth: 1, borderColor: c.g300 }]}>
                  <Text style={[text({ size: 14, weight: 700 }), { color: c.g700 }]}>루틴 보기</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={onEdit} style={[s.sheetBtn, { backgroundColor: c.pri }]}>
                  <Text style={[text({ size: 14, weight: 700 }), { color: '#fff' }]}>이 부위 수정</Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ── 최근 변화 (30일 게이트) ───────────────────────────────── */

function ChangesSection({ c, gateDays, locked, onOpen }: { c: Palette; gateDays: number; locked: boolean; onOpen: () => void }) {
  const left = Math.max(0, 30 - gateDays);
  return (
    <View style={[s.section, { backgroundColor: c.card }]}>
      <View style={s.rowBetween}>
        <Text style={[text({ size: 18, weight: 700, tracking: -0.035 }), { color: c.g900 }]}>최근 변화</Text>
        {!locked && (
          <Pressable accessibilityRole="button" onPress={onOpen} style={s.linkBtn}>
            <Text style={[text({ size: 12.5, weight: 600 }), { color: c.g500 }]}>커넥션</Text>
            <ChevronSmallGlyph color={c.g500} />
          </Pressable>
        )}
      </View>

      {locked && (
        <>
          <View style={s.gateRow}>
            <Image accessible={false} resizeMode="contain" source={CHEKI.insight} style={s.gateMascot} />
            <View style={s.flex1}>
              <Text style={[text({ size: 14.5, weight: 700, tracking: -0.03 }), { color: c.g900 }]}>기록의 연결을 살펴보고 있어요</Text>
              <Text style={[text({ size: 12.5, leading: 1.65 }), s.gateBody, { color: c.g600 }]}>
                30일이 모이면 수면·활동과 불편 사이의 패턴을 해석해 드려요. 추이 차트는 커넥션 탭에서 지금도 볼 수 있어요.
              </Text>
            </View>
          </View>
          <View style={s.gateProgress}>
            <View style={s.gateBaseline}>
              <Text style={[text({ size: 12, weight: 700 }), { color: c.g700 }]}>{gateDays}일 기록</Text>
              <Text style={[text({ size: 12, weight: 700 }), { color: c.pri }]}>해석까지 {left}일</Text>
            </View>
            <View style={[s.gateTrack, { backgroundColor: c.g200 }]}>
              <AnimatedProgressFill progress={gateDays / 30} style={[s.gateFill, { backgroundColor: c.pri }]} />
            </View>
          </View>
          <Pressable accessibilityRole="button" onPress={onOpen} style={[s.gateBtn, { borderColor: c.g300 }]}>
            <Text style={[text({ size: 13.5, weight: 700 }), { color: c.g800 }]}>추이 차트 먼저 보기</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

/* ── 오늘의 루틴 ───────────────────────────────────────────── */

function RoutineSection({ c, routine, onStart }: { c: Palette; routine: HomeView['routine']; onStart: () => void }) {
  const stretches = useStretchList();
  const hasRoutine = routine.moves.length > 0;
  const gif = hasRoutine && stretches.length > 0 ? pickStretchFor(stretches, `${routine.targetArea} ${routine.title}`) : undefined;

  return (
    <View style={[s.section, { backgroundColor: c.card }]}>
      <View style={s.rowBetween}>
        <Text style={[text({ size: 18, weight: 700, tracking: -0.035 }), { color: c.g900 }]}>오늘의 루틴</Text>
        {hasRoutine ? (
          <View style={[s.routineBadge, { backgroundColor: c.priLightest }]}>
            <Text style={[text({ size: 11, weight: 700 }), { color: c.priDk }]}>{routine.badge}</Text>
          </View>
        ) : null}
      </View>

      {hasRoutine ? (
        <>
          <View style={[s.routineCard, { backgroundColor: c.g100 }]}>
            <View style={s.routineTop}>
              <View style={[s.routineArt, { backgroundColor: c.card }]}>
                {gif ? <Image source={{ uri: gif.gifUrl }} style={s.routineGif} /> : <RoutineFigureGlyph accent={c.pri} ink={c.g800} />}
              </View>
              <View style={s.flex1}>
                <Text style={[text({ size: 16.5, weight: 700, tracking: -0.035 }), { color: c.g900 }]}>{routine.title}</Text>
                <View style={s.routineMetaRow}>
                  {routine.meta.map((m) => (
                    <View key={m} style={[s.routineChip, { backgroundColor: c.card }]}>
                      <Text style={[text({ size: 11, weight: 700 }), { color: c.g600 }]}>{m}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={[s.routineMoves, { borderTopColor: c.g200 }]}>
              {routine.moves.map((m) => (
                <View key={m.n} style={s.moveRow}>
                  <View style={[s.moveNum, { backgroundColor: c.card }]}>
                    <Text style={[text({ size: 10, weight: 700 }), { color: c.g600 }]}>{m.n}</Text>
                  </View>
                  <Text numberOfLines={1} style={[text({ size: 13, weight: 600 }), s.flex1, { color: c.g800 }]}>{m.name}</Text>
                  <Text style={[text({ size: 11.5, weight: 600, tabular: true }), { color: c.g500 }]}>{m.sec}</Text>
                </View>
              ))}
            </View>
          </View>

          <Pressable accessibilityRole="button" onPress={onStart} style={({ pressed }) => [s.routineCta, { backgroundColor: c.pri }, pressed && s.pressed]}>
            <PlayGlyph color="#fff" />
            <Text style={[text({ size: 15.5, weight: 700, tracking: -0.025 }), { color: '#fff' }]}>루틴 시작</Text>
          </Pressable>
        </>
      ) : (
        <View style={[s.routineEmpty, { backgroundColor: c.g100 }]}>
          <Text style={[text({ size: 13.5, weight: 600 }), { color: c.g600 }]}>{routine.title}</Text>
        </View>
      )}
    </View>
  );
}

/* ── 최근 기록 ─────────────────────────────────────────────── */

function RecentSection({ c, recent, onOpen }: { c: Palette; recent: HomeView['recent']; onOpen: () => void }) {
  const tagColors = (tone: 'ok' | 'mid' | 'bad') =>
    tone === 'bad' ? { bg: c.dangerBg, fg: c.dangerDk }
    : tone === 'ok' ? { bg: c.priLightest, fg: c.priDk }
    : { bg: c.g200, fg: c.g600 };

  return (
    <View style={[s.section, { backgroundColor: c.card }]}>
      <View style={s.rowBetween}>
        <Text style={[text({ size: 18, weight: 700, tracking: -0.035 }), { color: c.g900 }]}>최근 기록</Text>
        <Pressable accessibilityRole="button" onPress={onOpen} style={s.linkBtn}>
          <Text style={[text({ size: 12.5, weight: 600 }), { color: c.g500 }]}>전체</Text>
          <ChevronSmallGlyph color={c.g500} />
        </Pressable>
      </View>

      <View style={s.recentList}>
        {recent.map((r) => {
          const tag = tagColors(r.tone);
          const painOk = r.pain === '없음';
          return (
            <Pressable key={r.key} accessibilityRole="button" onPress={onOpen} style={[s.recentCard, { borderColor: c.g200, backgroundColor: c.card }]}>
              <View style={s.recentTop}>
                <View style={s.recentLeft}>
                  <View style={[s.avatar, { backgroundColor: tag.bg }]}>
                    <MoodGlyph color={tag.fg} size={18} tone={r.tone} />
                  </View>
                  <View style={s.flex1}>
                    <Text numberOfLines={1} style={[text({ size: 14.5, weight: 700, tracking: -0.03 }), { color: c.g900 }]}>{r.title}</Text>
                    <Text style={[text({ size: 11.5 }), s.recentTime, { color: c.g500 }]}>{r.time}</Text>
                  </View>
                </View>
                <View style={[s.tag, { backgroundColor: tag.bg }]}>
                  <Text style={[text({ size: 11.5, weight: 700 }), { color: tag.fg }]}>{r.tag}</Text>
                </View>
              </View>

              <View style={[s.recentBottom, { borderTopColor: c.g200 }]}>
                <Text style={[text({ size: 12 }), { color: c.g500 }]}>{r.date}</Text>
                {/*
                  두 칩 모두 display:flex 라 라벨과 값이 각각 flex 아이템이다.
                  수면 칩만 gap:4px 를 갖고, 불편 칩은 gap 이 없어 붙어서 렌더된다.
                */}
                <View style={s.recentChips}>
                  <View style={[s.chipOutline, { borderColor: c.g200 }]}>
                    <Text style={[text({ size: 11.5, weight: 700 }), { color: c.g700 }]}>수면</Text>
                    <Text style={[text({ size: 11.5, weight: 700 }), { color: c.g700 }]}>{r.sleep}</Text>
                  </View>
                  <View style={[s.chipSolid, { backgroundColor: painOk ? c.g100 : c.dangerBg }]}>
                    <Text style={[text({ size: 11.5, weight: 700 }), { color: painOk ? c.g600 : c.dangerDk }]}>불편</Text>
                    <Text style={[text({ size: 11.5, weight: 700 }), { color: painOk ? c.g600 : c.dangerDk }]}>{r.pain}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  body: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flex1: { flex: 1, minWidth: 0 },
  pressed: { transform: [{ scale: 0.975 }] },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  // header — height:52; padding:0 12px 0 20px
  header: { height: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 12 },
  headerSurface: { zIndex: 2, borderBottomWidth: StyleSheet.hairlineWidth },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dateBar: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  badge: { position: 'absolute', top: 6, right: 7, minWidth: 16, height: 16, paddingHorizontal: 4, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },

  // 상태 배너 — padding:0 20px 12px
  bannerWrap: { paddingHorizontal: 20, paddingBottom: 12 },
  syncBanner: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14 },
  syncDot: { width: 7, height: 7, borderRadius: 4 },

  errCard: { padding: 16, borderRadius: 16 },
  errRow: { flexDirection: 'row', gap: 11 },
  errIcon: { width: 32, height: 32, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  errBody: { marginTop: 5 },
  errActions: { marginTop: 12, flexDirection: 'row', gap: 7 },
  errBtn: { height: 38, paddingHorizontal: 15, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  errBtnGhost: { borderWidth: 1, borderColor: '#E8C4C4' },

  // 기록 전 히어로 — section padding:4px 20px 22px / hero padding:24px 20px 20px
  emptySection: { paddingTop: 4, paddingHorizontal: 20, paddingBottom: 22 },
  emptyHero: { paddingTop: 24, paddingHorizontal: 20, paddingBottom: 20, borderRadius: 24 },
  emptyMap: { marginTop: 6, height: 206, alignItems: 'center', justifyContent: 'center' },
  emptyMascot: { width: 200, height: 200 },
  emptyTitle: { marginTop: 11 },
  emptyCta: { marginTop: 18, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 28, backgroundColor: '#1E2D05' },
  emptyCaption: { marginTop: 11, textAlign: 'center' },

  // 이번 주 기록 — padding:16px 20px 20px
  weekSection: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 20 },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  weekMascot: { width: 96, height: 96, marginTop: -8, marginRight: -6, marginBottom: -8, marginLeft: -10 },
  progressWrap: { position: 'relative', marginTop: 44, height: 10 },
  progressTrack: { ...StyleSheet.absoluteFillObject, borderRadius: 6 },
  progressFill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: 6 },
  weekDot: { position: 'absolute', top: 2, width: 6, height: 6, borderRadius: 4, marginLeft: -3 },
  // CSS: left:71%; transform:translateX(-50%) — 진행률 지점에 pill 중심을 맞춘다
  pillAnchor: { position: 'absolute', top: -38, alignItems: 'center', transform: [{ translateX: '-50%' }] },
  pill: { height: 28, paddingHorizontal: 11, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  pillConnector: { width: 2, height: 8 },
  weekLabels: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' },

  // 공통 섹션 — margin-top:10; padding:18px 20px 20px
  section: { marginTop: 10, paddingTop: 18, paddingHorizontal: 20, paddingBottom: 20 },
  sectionTight: { paddingBottom: 18 }, // 오늘의 몸만 padding:18px 20px

  editPill: { height: 32, paddingHorizontal: 14, borderWidth: 1, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },

  bodyRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 16 },
  bodyMapSlot: { width: 96, alignItems: 'center' },
  bodyList: { flex: 1, minWidth: 0, gap: 6 },
  partRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 },
  partDot: { width: 8, height: 8, borderRadius: 5 },
  partMeta: { marginTop: 2 },

  facts: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, flexDirection: 'row' },
  fact: { flex: 1, minWidth: 0 },
  factValue: { marginTop: 5 },
  factSource: { marginTop: 3 },

  linkBtn: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 2 },

  gateRow: { marginTop: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  gateMascot: { width: 92, height: 92, marginTop: -16, marginRight: -4, marginBottom: -12, marginLeft: -12 },
  gateBody: { marginTop: 5 },
  gateProgress: { marginTop: 16 },
  gateBaseline: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  gateTrack: { position: 'relative', marginTop: 9, height: 8, borderRadius: 5, overflow: 'hidden' },
  gateFill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: 5 },
  gateBtn: { marginTop: 16, minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderWidth: 1, borderRadius: 24 },

  routineBadge: { height: 24, paddingHorizontal: 10, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  routineCard: { marginTop: 14, padding: 16, borderRadius: 20 },
  routineEmpty: { marginTop: 14, padding: 20, borderRadius: 20, alignItems: 'center' },
  routineTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  routineArt: { width: 84, height: 84, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  routineGif: { width: '100%', height: '100%' },
  routineMetaRow: { marginTop: 9, flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  routineChip: { height: 24, paddingHorizontal: 9, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  routineMoves: { marginTop: 14, paddingTop: 13, borderTopWidth: 1, gap: 7 },
  moveRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  moveNum: { width: 19, height: 19, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  routineCta: { marginTop: 12, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 27 },

  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(22,25,29,.5)', justifyContent: 'flex-end' },
  sheetCard: { padding: 22, paddingBottom: 34, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetCloseBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  sheetMeta: { marginTop: 4 },
  sheetTrendLabel: { marginTop: 22 },
  trendRow: { marginTop: 10, height: 92, paddingTop: 10, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', borderBottomWidth: 1 },
  trendCol: { width: 44, alignItems: 'center', gap: 6 },
  trendBarTrack: { height: 50, width: 22, justifyContent: 'flex-end' },
  trendBar: { width: '100%', borderRadius: 5 },
  sheetBtnRow: { marginTop: 20, flexDirection: 'row', gap: 8 },
  sheetBtn: { flex: 1, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },

  recentList: { marginTop: 12, gap: 8 },
  recentCard: { padding: 14, borderWidth: 1, borderRadius: 16 },
  recentTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  recentLeft: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 9 },
  avatar: { width: 38, height: 38, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  recentTime: { marginTop: 3 },
  tag: { height: 26, paddingHorizontal: 10, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  recentBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 11, borderTopWidth: 1 },
  recentChips: { flexDirection: 'row', gap: 6 },
  chipOutline: { height: 26, paddingHorizontal: 10, borderWidth: 1, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  chipSolid: { height: 26, paddingHorizontal: 10, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
