import { useState } from 'react';
import { useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigCheckGlyph, MonthPrevGlyph } from '@/components/glyphs';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import { AGREE } from '@/pages/auth/auth.data';

const DOCUMENT_IDS = { tos: 'terms', privacy: 'privacy', health: 'sensitive-health', marketing: 'optional-data' } as const;

/** `Momgirok v8.dc.html` → `isConsentStep` 을 그대로 옮긴 것. */
export default function ConsentScreen() {
  const c = usePalette();
  const router = useRouter();
  const [agree, setAgree] = useState<string[]>([]);

  const toggle = (id: string) => setAgree((cur) => (cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id]));
  const allOn = agree.length === AGREE.length;
  const toggleAll = () => setAgree(allOn ? [] : AGREE.map((a) => a.id));
  const requiredOk = AGREE.filter((a) => a.req === '필수').every((a) => agree.includes(a.id));

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.card }]}>
      <View style={[s.header, { borderBottomColor: c.g200 }]}>
        <Pressable accessibilityLabel="뒤로" accessibilityRole="button" onPress={() => router.back()} style={s.backBtn}>
          <MonthPrevGlyph color={c.g800} size={20} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <Text style={[text({ size: 25, weight: 700, tracking: -0.045, leading: 1.4 }), { color: c.g900 }]}>약관에 동의하면{'\n'}시작할 수 있어요</Text>
        <Text style={[text({ size: 13.5, leading: 1.7 }), s.sub, { color: c.g600 }]}>건강정보는 기록을 만들고 패턴을 찾는 데만 사용해요.</Text>

        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: allOn }} onPress={toggleAll} style={[s.allRow, { borderColor: allOn ? c.pri : c.g200, backgroundColor: allOn ? c.priLightest : c.card }]}>
          <View style={[s.allCheck, { backgroundColor: allOn ? c.pri : c.g300 }]}>
            <BigCheckGlyph color="#fff" size={14} strokeWidth={3.4} />
          </View>
          <Text style={[text({ size: 15.5, weight: 700, tracking: -0.03 }), { color: c.g900 }]}>전체 동의</Text>
        </Pressable>

        <View style={s.rowsWrap}>
          {AGREE.map((a, i) => {
            const on = agree.includes(a.id);
            return (
              <View key={a.id} style={[s.agreeRow, i < AGREE.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.g200 }]}>
                <Pressable accessibilityLabel={a.k} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => toggle(a.id)} style={s.checkBtn}>
                  <View style={[s.itemCheck, { backgroundColor: on ? c.pri : 'transparent', borderColor: on ? 'transparent' : c.g300, borderWidth: on ? 0 : 1.5 }]}>
                    <BigCheckGlyph color="#fff" size={12} strokeWidth={3.6} />
                  </View>
                </Pressable>
                <View style={s.agreeLabel}>
                  <View style={[s.reqBadge, { backgroundColor: a.req === '필수' ? c.priLightest : c.g100 }]}>
                    <Text style={[text({ size: 10, weight: 700 }), { color: a.req === '필수' ? c.priDk : c.g500 }]}>{a.req}</Text>
                  </View>
                  <Text numberOfLines={1} style={[text({ size: 14, weight: 600, tracking: -0.025 }), s.flex1, { color: c.g900 }]}>{a.k}</Text>
                </View>
                <Pressable accessibilityLabel={`${a.k} 전문 보기`} accessibilityRole="button" onPress={() => router.push(`/settings/legal/${DOCUMENT_IDS[a.id as keyof typeof DOCUMENT_IDS]}` as Href)} style={s.viewButton}>
                  <Text style={[text({ size: 12, weight: 600 }), s.viewLink, { color: c.g500 }]}>보기</Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        <View style={[s.noteBox, { backgroundColor: c.g100 }]}>
          <Text style={[text({ size: 12, leading: 1.7 }), { color: c.g600 }]}>마케팅 정보 수신은 선택이에요. 동의하지 않아도 모든 기능을 쓸 수 있어요.</Text>
        </View>
      </ScrollView>

      <View style={[s.footer, { borderTopColor: c.g200 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !requiredOk }}
          disabled={!requiredOk}
          onPress={() => router.replace('/(onboarding)/intro')}
          style={[s.ctaBtn, { backgroundColor: requiredOk ? c.pri : c.g300 }]}>
          <Text style={[text({ size: 16, weight: 700 }), { color: '#fff' }]}>동의하고 계속하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  body: { paddingTop: 8, paddingHorizontal: 20, paddingBottom: 20 },
  sub: { marginTop: 10 },

  allRow: { marginTop: 22, minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, borderWidth: 1.5, borderRadius: 16 },
  allCheck: { width: 24, height: 24, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },

  rowsWrap: { marginTop: 8 },
  agreeRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 4 },
  checkBtn: { width: 44, height: 44, marginLeft: -10, alignItems: 'center', justifyContent: 'center' },
  itemCheck: { width: 22, height: 22, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  agreeLabel: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6 },
  reqBadge: { height: 20, paddingHorizontal: 7, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  viewLink: { minHeight: 40, textAlignVertical: 'center', textDecorationLine: 'underline' },
  viewButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },

  noteBox: { marginTop: 18, padding: 14, paddingHorizontal: 16, borderRadius: 16 },

  footer: { padding: 12, paddingHorizontal: 20, paddingBottom: 26, borderTopWidth: 1 },
  ctaBtn: { height: 54, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
