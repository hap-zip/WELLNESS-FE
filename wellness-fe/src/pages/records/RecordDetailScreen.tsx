import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BodyMap } from '@/components/body-map';
import { HkGlyph, MonthPrevGlyph } from '@/components/glyphs';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import type { Palette } from '@/theme/palette';
import { wellnessApi } from '@/services/wellness-api';
import type { AutoHealthRecord } from '@/domain/wellness';
import { useDailyCheck } from '@/context/daily-check-context';
import { DAY_GROUPS, DAY_MEMO, DAY_PARTS, DAY_TONE, TODAY, WEEKDAYS, type DayTone } from './records.data';

/**
 * `Momgirok v8.dc.html` → `<sc-if value="{{ isDayDetail }}">` 블록을 그대로 옮긴 것.
 *
 * 프로토타입에서 `dayGroups`·부위 목록·메모는 `selDay` 값과 무관하게 고정된 시연
 * 데이터다(캘린더 화면의 `dayRows`도 마찬가지). 여기서도 헤더의 날짜·태그만
 * 실제 파라미터를 따르고, 본문 내용은 같은 고정 데이터셋을 그대로 보여준다.
 */

function parseDateParam(raw: string | undefined) {
  if (raw) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (m) return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
  }
  return { ...TODAY };
}

export default function RecordDetailScreen() {
  const c = usePalette();
  const router = useRouter();
  const { startDraft } = useDailyCheck();
  const params = useLocalSearchParams<{ date?: string }>();
  const { year, month, day } = parseDateParam(params.date);
  const dateId = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const [healthRecord, setHealthRecord] = useState<AutoHealthRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadMessage, setLoadMessage] = useState('');

  const tone: DayTone | undefined = year === TODAY.year && month === TODAY.month ? DAY_TONE[day] : undefined;
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  const selLabel = `${month}월 ${day}일 ${weekday}요일`;
  const tagLabel = tone ? (tone === 'ok' ? '불편 없음' : tone === 'mid' ? '가벼운 불편' : '뚜렷한 불편') : '미기록';
  const hasHealthData = healthRecord ? [healthRecord.sleepDuration, healthRecord.steps, healthRecord.activityEnergy].some((value) => value !== '기록 없음') : false;
  const groups = useMemo(() => {
    const autoGroup = healthRecord ? { key: 'auto', title: '자동 수집', src: 'Apple 건강', icon: 'health' as const, tone: false, photos: 0, rows: [
      { key: 'sleep', label: '수면 시간', value: healthRecord.sleepDuration, tone: false },
      { key: 'bedtime', label: '취침 시각', value: healthRecord.bedtime, tone: false },
      { key: 'steps', label: '걸음 수', value: healthRecord.steps, tone: false },
      { key: 'energy', label: '활동 에너지', value: healthRecord.activityEnergy, tone: false },
    ] } : null;
    if (tone) return autoGroup ? [autoGroup, ...DAY_GROUPS.filter((group) => group.key !== 'auto')] : DAY_GROUPS;
    return autoGroup && hasHealthData ? [autoGroup] : [];
  }, [hasHealthData, healthRecord, tone]);

  useEffect(() => {
    let active = true; setLoading(true); setLoadMessage('');
    void wellnessApi.getAutoHealthRecord(dateId).then((record) => { if (active) setHealthRecord(record); }).catch((reason) => { if (active) setLoadMessage(reason instanceof Error ? reason.message : '건강 데이터를 불러오지 못했어요.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [dateId]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/records'));
  const goCheck = () => {
    startDraft(dateId, tone ? 'edit' : 'create');
    router.push('/check/auto');
  };
  const remove = () => Alert.alert('이 날 기록을 삭제할까요?', '삭제한 기록은 되돌릴 수 없어요.', [
    { text: '취소', style: 'cancel' },
    { text: '삭제', style: 'destructive', onPress: goBack },
  ]);

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.bg }]}>
      {/* 헤더 — height:52; border-bottom:1px */}
      <View style={[s.header, { backgroundColor: c.card, borderBottomColor: c.g200 }]}>
        <Pressable accessibilityLabel="뒤로" accessibilityRole="button" onPress={goBack} style={s.backBtn}>
          <MonthPrevGlyph color={c.g800} size={20} />
        </Pressable>
        <Text numberOfLines={1} style={[text({ size: 16, weight: 700, tracking: -0.03 }), s.flex1, { color: c.g900 }]}>{selLabel}</Text>
        <Pressable accessibilityRole="button" onPress={goCheck} style={s.editBtn}>
          <Text style={[text({ size: 13, weight: 700 }), { color: c.priDk }]}>수정</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? <View style={[s.loading, { backgroundColor: c.card }]}><ActivityIndicator color={c.pri}/><Text style={[text({ size: 13 }), { color: c.g600 }]}>이 날짜의 데이터를 불러오는 중이에요</Text></View> : null}
        {/* 바디맵 요약 — padding:18px 20px 20px */}
        {!loading && tone ? <View style={[s.section, { backgroundColor: c.card }]}> 
          <View style={s.bodyRow}>
            <View style={s.bodyMapSlot}>
              <BodyMap height={145} label="이 날 기록된 불편 부위" marks={DAY_PARTS.map((p) => p.id)} width={94} />
            </View>
            <View style={s.flex1}>
              <View style={[s.tag, { backgroundColor: tone === 'bad' ? c.dangerBg : tone === 'ok' ? c.priLightest : c.g200 }]}>
                <Text style={[text({ size: 12, weight: 700 }), { color: tone === 'bad' ? c.dangerDk : tone === 'ok' ? c.priDk : c.g600 }]}>{tagLabel}</Text>
              </View>
              <View style={s.partList}>
                {DAY_PARTS.map((p) => (
                  <View key={p.id} style={s.partRow}>
                    <View style={[s.partDot, { backgroundColor: c.danger }]} />
                    <Text numberOfLines={1} style={[text({ size: 13.5, weight: 700, tracking: -0.03 }), s.flex1, { color: c.g900 }]}>{p.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View> : null}

        {!loading && groups.map((g) => (
          <GroupSection c={c} group={g} key={g.key} />
        ))}

        {/* 메모 — padding:16px 20px 18px */}
        {!loading && tone ? <View style={[s.groupSection, { backgroundColor: c.card }]}> 
          <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>메모</Text>
          <View style={[s.memoBox, { backgroundColor: c.g100 }]}>
            <Text style={[text({ size: 13.5, leading: 1.7 }), { color: c.g700 }]}>{DAY_MEMO}</Text>
          </View>
        </View> : null}

        {!loading && groups.length === 0 ? <View style={[s.empty, { backgroundColor: c.card }]}><Text style={[text({ size: 16, weight: 700 }), { color: c.g800 }]}>이 날짜의 기록이 없어요</Text><Text style={[text({ size: 13, leading: 1.7 }), s.emptyMessage, { color: c.g500 }]}>{loadMessage || 'Apple 건강에도 저장된 수면·걸음·활동 데이터가 없어요.'}</Text><Pressable accessibilityRole="button" onPress={goCheck} style={[s.emptyButton, { backgroundColor: c.pri }]}><Text style={[text({ size: 14, weight: 700 }), { color: '#fff' }]}>이 날 기록하기</Text></Pressable></View> : null}

        {/* 액션 — padding:16px 20px 22px */}
        {!loading && tone ? <View style={[s.groupSection, s.actionSection, { backgroundColor: c.card }]}> 
          <Pressable accessibilityRole="button" onPress={goCheck} style={[s.actionBtn, { borderColor: c.g300 }]}>
            <Text style={[text({ size: 14, weight: 700 }), { color: c.g800 }]}>이 날 기록 수정</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={remove} style={[s.actionBtn, s.deleteBtn]}>
            <Text style={[text({ size: 14, weight: 700 }), { color: c.dangerDk }]}>이 날 기록 삭제</Text>
          </Pressable>
        </View> : null}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function GroupSection({ c, group }: { c: Palette; group: (typeof DAY_GROUPS)[number] }) {
  return (
    <View style={[s.groupSection, { backgroundColor: c.card }]}>
      <View style={s.groupHead}>
        <View style={[s.groupIconWrap, { backgroundColor: group.tone ? c.dangerBg : c.priLightest }]}>
          <HkGlyph color={group.tone ? c.dangerDk : c.priDk} id={group.icon} size={15} />
        </View>
        <Text style={[text({ size: 13, weight: 700, tracking: -0.025 }), s.flex1, { color: c.g900 }]}>{group.title}</Text>
        <View style={[s.srcBadge, { backgroundColor: c.g100 }]}>
          <Text style={[text({ size: 10.5, weight: 700 }), { color: c.g500 }]}>{group.src}</Text>
        </View>
      </View>

      <View style={s.groupRows}>
        {group.rows.map((row, i) => (
          <View key={row.key} style={[s.groupRow, i < group.rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.g200 }]}>
            <Text style={[text({ size: 13 }), { color: c.g600 }]}>{row.label}</Text>
            <Text style={[text({ size: 13.5, weight: 700, tracking: -0.025, leading: 1.5, tabular: true }), s.groupRowValue, { color: row.tone ? c.danger : c.g900 }]}>{row.value}</Text>
          </View>
        ))}
      </View>

      {group.photos > 0 ? (
        <View style={s.thumbs}>
          {Array.from({ length: group.photos }).map((_, i) => (
            <View key={i} style={[s.thumb, { backgroundColor: c.g300 }]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },

  header: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 8, borderBottomWidth: 1 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  editBtn: { minHeight: 40, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },

  section: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 20 },
  bodyRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bodyMapSlot: { width: 96, alignItems: 'center' },
  tag: { alignSelf: 'flex-start', height: 28, paddingHorizontal: 12, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  partList: { marginTop: 10, gap: 6 },
  partRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  partDot: { width: 7, height: 7, borderRadius: 4 },

  groupSection: { marginTop: 10, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 18 },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupIconWrap: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  srcBadge: { height: 22, paddingHorizontal: 8, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  groupRows: { marginTop: 10 },
  groupRow: { minHeight: 42, paddingVertical: 5, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  groupRowValue: { flexShrink: 0, maxWidth: '60%', textAlign: 'right' },
  thumbs: { marginTop: 12, flexDirection: 'row', gap: 8 },
  thumb: { width: 64, height: 64, borderRadius: 14 },

  memoBox: { marginTop: 9, padding: 14, borderRadius: 14 },

  actionSection: { paddingBottom: 22, gap: 9 },
  actionBtn: { minHeight: 50, borderWidth: 1, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { borderColor: '#E8C4C4' },
  loading: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 12 },
  empty: { padding: 32, alignItems: 'center' },
  emptyMessage: { marginTop: 8, textAlign: 'center' },
  emptyButton: { marginTop: 18, minHeight: 46, paddingHorizontal: 22, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
