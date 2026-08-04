import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

import { styles } from './splash.styles';

function PulseDot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [delay, opacity]);

  return <Animated.View style={[styles.dot, { opacity }]} />;
}

export default function SplashScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.content}>
        <View accessible accessibilityLabel="몸기록 로고" style={styles.logo}>
          <View style={styles.logoMark} />
        </View>

        <Text style={styles.title}>
          놓치고 있던 내 기록을{`\n`}차분하게 연결해요
        </Text>

        <View accessibilityLabel="로딩 중" style={styles.dots}>
          <PulseDot delay={0} />
          <PulseDot delay={200} />
          <PulseDot delay={400} />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="계속"
        onPress={() => router.replace('/(auth)/login')}
        style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}>
        <Text style={styles.continueText}>계속</Text>
      </Pressable>
    </View>
  );
}
