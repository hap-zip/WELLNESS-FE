import { useMemo, useRef, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BigCheckGlyph, CopyGlyph } from '@/components/glyphs';
import { SubScreenHeader } from '@/components/ui/sub-screen-header';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import { DEFAULT_SUM_SELECTION, SUM_FIELDS, SUM_PERIODS, SUM_PREVIEW_ROWS, sumRangeFor } from '@/pages/me/me.data';

/**
 * `Momgirok v8.dc.html` → `isSubSummary` 를 그대로 옮긴 것.
 * 기간·항목 선택 → 미리보기 → 공유가 별도 화면이 아니라 한 화면 안에 있다.
 */
export default function ReportSetupScreen() {
  const c = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<(typeof SUM_PERIODS)[number]>('최근 30일');
  const [selected, setSelected] = useState<string[]>(DEFAULT_SUM_SELECTION);
  const [shared, setShared] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const previewRef = useRef<View>(null);

  const toggle = (f: string) => setSelected((cur) => (cur.includes(f) ? cur.filter((v) => v !== f) : [...cur, f]));
  const range = useMemo(() => sumRangeFor(period), [period]);
  const shareLink = 'momgirok.app/s/8fK2qP';
  const copyLink = async () => {
    await Clipboard.setStringAsync(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const saveImage = async () => {
    if (!previewRef.current || savingImage) return;
    setSavingImage(true);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync(true);
      if (!permission.granted) throw new Error('사진 저장 권한이 필요해요. 기기 설정에서 허용해 주세요.');
      const uri = await captureRef(previewRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await MediaLibrary.createAssetAsync(uri);
      Alert.alert('저장 완료', '하음 요약 카드를 사진 보관함에 저장했어요.');
    } catch (reason) {
      Alert.alert('저장하지 못했어요', reason instanceof Error ? reason.message : '사진 저장 권한을 확인해 주세요.');
    } finally { setSavingImage(false); }
  };

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.bg }]}>
      <SubScreenHeader backLabel="마이 화면으로 돌아가기" fallback={() => router.replace('/(tabs)/me')} title="요약 카드 만들기" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false}>
        <View style={[s.section, { backgroundColor: c.card }]}>
          <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>기간</Text>
          <View style={s.periodRow}>
            {SUM_PERIODS.map((p) => {
              const active = p === period;
              return (
                <Pressable key={p} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => setPeriod(p)} style={[s.periodPill, { borderColor: active ? c.g900 : c.g300, backgroundColor: active ? c.g900 : c.card }]}>
                  <Text style={[text({ size: 13, weight: active ? 700 : 500 }), { color: active ? c.card : c.g600 }]}>{p}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={s.fieldsHead}>
            <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>포함할 데이터</Text>
            <Text style={[text({ size: 12, weight: 700, tabular: true }), { color: c.priDk }]}>{selected.length}개</Text>
          </View>
          <View style={s.fieldsRow}>
            {SUM_FIELDS.map((f) => {
              const on = selected.includes(f);
              return (
                <Pressable key={f} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => toggle(f)} style={[s.fieldChip, { borderColor: on ? c.pri : c.g200, backgroundColor: on ? c.priLightest : 'transparent' }]}>
                  <Text style={[text({ size: 12.5, weight: on ? 700 : 500 }), { color: on ? c.priDk : c.g600 }]}>{f}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[s.section, s.previewSection, { backgroundColor: c.card }]}>
          <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>미리보기</Text>
          <View collapsable={false} ref={previewRef} style={[s.previewCard, { borderColor: c.g200, backgroundColor: c.card }]}>
            <View style={s.previewHead}>
              <Text style={[text({ size: 11, weight: 700, tracking: 0.06 }), { color: c.g500 }]}>하음 요약</Text>
              <Text style={[text({ size: 11, weight: 600, tabular: true }), { color: c.g500 }]}>{range}</Text>
            </View>
            <Text style={[text({ size: 17, weight: 700, tracking: -0.035 }), s.previewTitle, { color: c.g900 }]}>어깨 앞 불편이 반복 기록됨</Text>
            <View style={s.previewRows}>
              {SUM_PREVIEW_ROWS.map((row, i) => (
                <View key={row.key} style={[s.previewRow, i < SUM_PREVIEW_ROWS.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.g200 }]}>
                  <Text style={[text({ size: 12.5 }), { color: c.g600 }]}>{row.k}</Text>
                  <Text style={[text({ size: 13, weight: 700, tracking: -0.025, tabular: true }), { color: c.g900 }]}>{row.v}</Text>
                </View>
              ))}
            </View>
            <Text style={[text({ size: 10.5, leading: 1.65 }), s.disclaimer, { color: c.g400 }]}>사용자가 직접 기록한 값과 Apple 건강 데이터를 정리한 자료예요. 진단 목적으로 사용할 수 없어요.</Text>
          </View>
        </View>

        <View style={[s.section, s.shareSection, { backgroundColor: c.card }]}>
          <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>공유</Text>
          {!shared ? (
            <>
              <Pressable accessibilityRole="button" onPress={() => setShared(true)} style={[s.makeLinkBtn, { backgroundColor: c.pri }]}>
                <Text style={[text({ size: 15.5, weight: 700 }), { color: '#fff' }]}>공유 링크 만들기</Text>
              </Pressable>
              <View style={s.saveRow}>
                <Pressable accessibilityRole="button" accessibilityState={{ busy: savingImage, disabled: savingImage }} disabled={savingImage} onPress={() => void saveImage()} style={[s.saveBtn, { borderColor: c.g300, opacity: savingImage ? 0.6 : 1 }]}> 
                  <Text style={[text({ size: 13, weight: 700 }), { color: c.g700 }]}>{savingImage ? '저장 중…' : '이미지로 저장'}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" style={[s.saveBtn, { borderColor: c.g300 }]}>
                  <Text style={[text({ size: 13, weight: 700 }), { color: c.g700 }]}>PDF로 저장</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={[s.shareCard, { backgroundColor: c.priLightest }]}>
              <View style={s.shareHead}>
                <View style={[s.dot, { backgroundColor: c.pri }]} />
                <Text style={[text({ size: 12, weight: 700 }), { color: c.priDk }]}>링크가 만들어졌어요</Text>
              </View>
              <View style={[s.linkRow, { backgroundColor: c.card }]}>
                <Text numberOfLines={1} style={[s.linkText, { color: c.g700 }]}>{shareLink}</Text>
                <Pressable accessibilityLabel={copied ? '링크가 복사됐어요' : '링크 복사'} accessibilityRole="button" onPress={() => void copyLink()} style={[s.copyBtn, { backgroundColor: copied ? c.priLightest : c.g100 }]}>
                  {copied ? <BigCheckGlyph color={c.priDk} size={14} strokeWidth={3} /> : <CopyGlyph color={c.g700} />}
                </Pressable>
              </View>
              <View style={s.expireRow}>
                <Text style={[text({ size: 11.5 }), { color: c.g600 }]}>만료</Text>
                <Text style={[text({ size: 12, weight: 700 }), { color: c.g800 }]}>2026년 8월 20일 (7일 후)</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => setShared(false)} style={[s.revokeBtn, { borderColor: '#E8C4C4', backgroundColor: c.card }]}>
                <Text style={[text({ size: 13, weight: 700 }), { color: c.dangerDk }]}>공유 취소</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  section: { padding: 16, paddingHorizontal: 20 },
  periodRow: { marginTop: 10, flexDirection: 'row', gap: 7 },
  periodPill: { height: 36, paddingHorizontal: 16, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  fieldsHead: { marginTop: 20, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  fieldsRow: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  fieldChip: { minHeight: 38, paddingHorizontal: 14, borderWidth: 1.5, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  previewSection: { marginTop: 10, paddingBottom: 20 },
  previewCard: { marginTop: 12, padding: 18, borderWidth: 1, borderRadius: 20 },
  previewHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewTitle: { marginTop: 14 },
  previewRows: { marginTop: 12 },
  previewRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  disclaimer: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'transparent' },

  shareSection: { marginTop: 10, paddingBottom: 22 },
  makeLinkBtn: { marginTop: 12, height: 52, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  saveRow: { marginTop: 10, flexDirection: 'row', gap: 8 },
  saveBtn: { flex: 1, minHeight: 46, borderWidth: 1, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  shareCard: { marginTop: 12, padding: 16, borderRadius: 18 },
  shareHead: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  linkRow: { marginTop: 11, padding: 12, paddingHorizontal: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  linkText: { flex: 1, minWidth: 0, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 11.5, fontWeight: '500' },
  copyBtn: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  expireRow: { marginTop: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  revokeBtn: { marginTop: 14, minHeight: 44, borderWidth: 1, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
});
