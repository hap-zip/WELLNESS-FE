import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandWordmark } from '@/components/ui/auth-flow';
import { useAuth } from '@/context/auth-context';

import { styles } from './splash.styles';

export default function SplashScreen() {
  const router = useRouter();
  const { isRestoring, session } = useAuth();
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(12)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!active || reduceMotion) {
        contentOpacity.setValue(1);
        contentY.setValue(0);
        progress.setValue(1);
        return;
      }
      Animated.parallel([
        Animated.timing(contentOpacity, { duration: 280, easing: Easing.out(Easing.cubic), toValue: 1, useNativeDriver: true }),
        Animated.timing(contentY, { duration: 320, easing: Easing.out(Easing.cubic), toValue: 0, useNativeDriver: true }),
        Animated.timing(progress, { duration: 700, easing: Easing.out(Easing.cubic), toValue: 1, useNativeDriver: true }),
      ]).start();
    });
    return () => { active = false; };
  }, [contentOpacity, contentY, progress]);

  useEffect(() => {
    if (isRestoring) return;
    const target = !session ? '/(auth)/login' : session.onboardingComplete === false ? '/(onboarding)/intro' : '/(tabs)/home';
    const timer = setTimeout(() => router.replace(target), 720);
    return () => clearTimeout(timer);
  }, [isRestoring, router, session]);

  return <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
    <StatusBar style="light"/>
    <View style={styles.top}><BrandWordmark inverse/></View>
    <Animated.View style={[styles.content, { opacity: contentOpacity, transform: [{ translateY: contentY }] }]}>
      <Text accessibilityRole="header" style={styles.title}>오늘의 몸을 남기고,{`\n`}내 변화를 읽어요.</Text>
      <Text style={styles.description}>수면, 활동, 불편함을 한곳에 기록하는 가장 개인적인 웰니스 장부</Text>
    </Animated.View>
    <View accessibilityLabel="앱을 준비하는 중" accessibilityRole="progressbar" style={styles.progressTrack}><Animated.View style={[styles.progressValue, { transform: [{ scaleX: progress }] }]}/></View>
  </SafeAreaView>;
}
