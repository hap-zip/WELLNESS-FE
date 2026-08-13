import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type OnboardingScene } from '@/components/ui/auth-flow';
import { Momi, type MomiMood } from '@/components/momi';
import { layout } from '@/theme/tokens';

import { styles } from './onboarding-intro.styles';

const SCENES: readonly { id: OnboardingScene; title: string; description: string; note: string }[] = [
  { id: 'record', title: '하루 3분, 몸 상태를 남겨요', description: '수면·컨디션·불편 부위를 간단히 고르면 오늘의 기록이 끝나요.', note: '' },
  { id: 'connect', title: '따로 적은 기록을\n함께 살펴봐요.', description: '기록이 쌓이면 평소 상태와 비교해 반복되는 흐름을 보여드려요.', note: '최소 30일 후 상세 패턴 분석' },
  { id: 'act', title: '오늘 할 수 있는\n작은 행동으로 이어가요.', description: '내 기록을 바탕으로 무리 없는 짧은 루틴과 확인할 내용을 제안해요.', note: '진단이 아닌 생활 기록 기반 안내' },
];

export default function OnboardingIntroScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pageWidth = Math.min(width, layout.maxContentWidth);
  const pager = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  const moveNext = () => {
    if (page === SCENES.length - 1) { router.push('/(onboarding)/consent'); return; }
    pager.current?.scrollTo({ animated: !reduceMotion, x: pageWidth * (page + 1) });
  };
  const updatePage = (event: NativeSyntheticEvent<NativeScrollEvent>) => setPage(Math.round(event.nativeEvent.contentOffset.x / pageWidth));

  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
    <View style={[styles.shell, { width: pageWidth }]}>
      <View style={styles.topBar}><Pressable accessibilityRole="button" onPress={() => router.push('/(onboarding)/consent')} style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}><Text style={styles.skipText}>건너뛰기</Text></Pressable></View>
      <View accessibilityLabel={`서비스 안내 ${SCENES.length}개 중 ${page + 1}번째`} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: SCENES.length, now: page + 1 }} style={styles.progress}>{SCENES.map((scene, index) => <View key={scene.id} style={[styles.progressItem, index === page && styles.progressActive]}/>)}</View>
      <ScrollView bounces={false} decelerationRate="fast" horizontal onMomentumScrollEnd={updatePage} pagingEnabled ref={pager} showsHorizontalScrollIndicator={false}>
        {SCENES.map((scene, index) => <View key={scene.id} style={[styles.page, { width: pageWidth }]}><View style={styles.visual}><Momi mood={(['neutral','happy','cheer'] as MomiMood[])[index]} showShadow size={132}/></View><View style={styles.copy}><Text accessibilityRole="header" style={styles.title}>{scene.title}</Text><Text style={styles.description}>{scene.description}</Text><Text style={styles.noteText}>{scene.note}</Text></View></View>)}
      </ScrollView>
      <View style={styles.footer}><Pressable accessibilityRole="button" onPress={moveNext} style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}><Text style={styles.nextButtonText}>{page === SCENES.length - 1 ? '내 기록 시작하기' : '다음'}</Text></Pressable></View>
    </View>
  </SafeAreaView>;
}
