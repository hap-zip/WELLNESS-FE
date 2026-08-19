import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CHEKI } from '@/lib/cheki';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import { ONBOARD_PAGES } from '@/pages/auth/auth.data';

const FEATURES = [
  { mascot: CHEKI.recording, label: '오늘의 통합 기록', value: '자동 수면·걸음 + 직접 몸 체크', badge: '1분' },
  { mascot: CHEKI.insight, label: '반복해서 나타난 패턴', value: '엎드려 자기 ↔ 목 불편', badge: '근거' },
  { mascot: CHEKI.painCheck, label: '루틴 효과 확인', value: '최근 3번 중 2번 편해졌어요', badge: '피드백' },
  { mascot: CHEKI.chat, label: '참고한 내 기록', value: '최근 7일 수면 · 컨디션 · 활동량', badge: '챗' },
] as const;

export default function OnboardingIntroScreen() {
  const c = usePalette();
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const [page, setPage] = useState(0);
  const lastPage = page === ONBOARD_PAGES.length - 1;
  const isPreview = preview === '1';
  const continueSetup = () => isPreview ? router.dismissTo('/(tabs)/me') : router.replace('/(onboarding)/health-connect');
  const next = () => lastPage ? continueSetup() : setPage((current) => current + 1);
  const content = ONBOARD_PAGES[page];
  const feature = FEATURES[page];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[s.screen, { backgroundColor: c.card }]}>
      <View style={s.skipRow}>
        <Pressable accessibilityRole="button" onPress={continueSetup} style={s.skipBtn}>
          <Text style={[text({ size: 13, weight: 600 }), { color: c.g500 }]}>{isPreview ? '닫기' : '소개 건너뛰기'}</Text>
        </Pressable>
      </View>

      <View style={s.main}>
        <View style={[s.illustration, { backgroundColor: c.priLightest }]}> 
          <View style={[s.orbit, { borderColor: c.pri }]} />
          <View style={[s.orbitDot, { backgroundColor: c.pri }]} />
          <Image accessible={false} resizeMode="contain" source={feature.mascot} style={s.mascot} />
          <View style={[s.featureCard, { backgroundColor: c.card, borderColor: c.g200 }]}> 
            <View style={s.featureCopy}>
              <Text style={[s.featureLabel, { color: c.g500 }]}>{feature.label}</Text>
              <Text numberOfLines={1} style={[s.featureValue, { color: c.g900 }]}>{feature.value}</Text>
            </View>
            <View style={[s.featureBadge, { backgroundColor: c.priLightest }]}>
              <Text style={[s.featureBadgeText, { color: c.priDk }]}>{feature.badge}</Text>
            </View>
          </View>
        </View>

        <View style={s.progressRow}>
          <Text style={[s.pageNumber, { color: c.priDk }]}>0{page + 1}</Text>
          <View style={s.dots}>{ONBOARD_PAGES.map((_, index) => <View key={index} style={[s.dot, { width: page === index ? 22 : 6, backgroundColor: page === index ? c.pri : c.g300 }]} />)}</View>
          <Text style={[s.pageNumber, { color: c.g400 }]}>0{ONBOARD_PAGES.length}</Text>
        </View>

        <Text style={[s.eyebrow, { color: c.priDk }]}>{content.eyebrow}</Text>
        <Text lineBreakStrategyIOS="hangul-word" textBreakStrategy="balanced" style={[text({ size: 27, weight: 700, tracking: -0.045, leading: 1.35 }), s.title, { color: c.g900 }]}>{content.title}</Text>
        <Text lineBreakStrategyIOS="hangul-word" textBreakStrategy="balanced" style={[text({ size: 15, leading: 1.7 }), s.desc, { color: c.g600 }]}>{content.desc}</Text>
      </View>

      <View style={s.footer}>
        <Pressable accessibilityRole="button" onPress={next} style={({ pressed }) => [s.ctaBtn, { backgroundColor: c.pri }, pressed && s.pressed]}>
          <Text style={[text({ size: 16, weight: 700 }), { color: '#fff' }]}>{lastPage ? isPreview ? '확인 완료' : '내 기준 설정하기' : '다음 기능 보기'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  pressed: { transform: [{ scale: 0.975 }] },
  skipRow: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 16 },
  skipBtn: { minHeight: 44, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  main: { flex: 1, minHeight: 0, justifyContent: 'center', paddingHorizontal: 20 },
  illustration: { height: 300, borderRadius: 30, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  orbit: { position: 'absolute', top: 24, width: 218, height: 218, borderWidth: 1, borderRadius: 109, opacity: 0.22 },
  orbitDot: { position: 'absolute', top: 42, right: 83, width: 8, height: 8, borderRadius: 4 },
  mascot: { width: 214, height: 214, marginTop: -36 },
  featureCard: { position: 'absolute', right: 16, bottom: 16, left: 16, minHeight: 68, borderWidth: 1, borderRadius: 19, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center' },
  featureCopy: { flex: 1, minWidth: 0 },
  featureLabel: { fontFamily: 'Pretendard-Medium', fontSize: 11.5 },
  featureValue: { marginTop: 4, fontFamily: 'Pretendard-Bold', fontSize: 14 },
  featureBadge: { minWidth: 42, height: 30, marginLeft: 10, paddingHorizontal: 9, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  featureBadgeText: { fontFamily: 'Pretendard-Bold', fontSize: 11 },
  progressRow: { marginTop: 23, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { height: 6, borderRadius: 3 },
  pageNumber: { fontFamily: 'Pretendard-SemiBold', fontSize: 10, letterSpacing: 1 },
  eyebrow: { marginTop: 18, fontFamily: 'Pretendard-Bold', fontSize: 12, letterSpacing: 1.1, textAlign: 'center' },
  title: { marginTop: 8, textAlign: 'center' },
  desc: { marginTop: 9, paddingHorizontal: 7, textAlign: 'center' },
  footer: { paddingHorizontal: 20, paddingBottom: 32 },
  ctaBtn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
