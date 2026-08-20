import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useAuth } from '@/context/auth-context';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { usePalette } from '@/theme/use-palette';

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);
const INITIAL_X = [-100, -50, 0, 50, 100] as const;
const FINAL_X = [-26, -26, 0, 26, 26] as const;
const GLYPHS = ['하', '루', '+', '이', '음'] as const;
const PARTICLES = [
  { x: -74, y: -32, rotate: '-18deg', width: 18 },
  { x: -58, y: 36, rotate: '24deg', width: 11 },
  { x: -18, y: -54, rotate: '82deg', width: 13 },
  { x: 22, y: 52, rotate: '-72deg', width: 16 },
  { x: 62, y: -38, rotate: '28deg', width: 12 },
  { x: 78, y: 25, rotate: '-12deg', width: 19 },
] as const;

type GlyphProps = {
  index: number;
  opacity: Animated.Value;
  merge: Animated.Value;
  color: string;
};

function MotionGlyph({ index, opacity, merge, color }: GlyphProps) {
  const stays = index === 0 || index === 4;
  const scatterY = index === 1 ? -18 : index === 2 ? 16 : 22;
  const scatterX = index === 1 ? -8 : index === 2 ? 0 : 8;
  const finalOpacity = stays ? 1 : 0;

  return (
    <Animated.Text
      style={[
        styles.glyph,
        index === 2 && styles.operator,
        {
          color,
          opacity: Animated.multiply(
            opacity,
            merge.interpolate({ inputRange: [0, 0.62, 1], outputRange: [1, stays ? 1 : 0.34, finalOpacity] }),
          ),
          transform: [
            {
              translateX: merge.interpolate({
                inputRange: [0, 1],
                outputRange: [INITIAL_X[index], FINAL_X[index] + (stays ? 0 : scatterX)],
              }),
            },
            { translateY: merge.interpolate({ inputRange: [0, 1], outputRange: [0, stays ? 0 : scatterY] }) },
            { scale: merge.interpolate({ inputRange: [0, 1], outputRange: [1, stays ? 1.04 : 0.94] }) },
          ],
        },
      ]}>
      {GLYPHS[index]}
    </Animated.Text>
  );
}

function MergeSignal({ merge, primary, muted }: { merge: Animated.Value; primary: string; muted: string }) {
  return (
    <View pointerEvents="none" style={styles.signal}>
      <Animated.View
        style={[
          styles.signalRing,
          {
            borderColor: primary,
            opacity: merge.interpolate({ inputRange: [0, 0.14, 0.68, 1], outputRange: [0, 0.24, 0.1, 0] }),
            transform: [{ scale: merge.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.14] }) }],
          },
        ]}
      />
      {PARTICLES.map((particle, index) => (
        <Animated.View
          key={`${particle.x}-${particle.y}`}
          style={[
            styles.particle,
            {
              width: particle.width,
              backgroundColor: index % 2 === 0 ? primary : muted,
              opacity: merge.interpolate({ inputRange: [0, 0.16, 0.72, 1], outputRange: [0, 0.78, 0.24, 0] }),
              transform: [
                { translateX: merge.interpolate({ inputRange: [0, 1], outputRange: [particle.x * 0.22, particle.x] }) },
                { translateY: merge.interpolate({ inputRange: [0, 1], outputRange: [particle.y * 0.22, particle.y] }) },
                { rotate: particle.rotate },
                { scale: merge.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

function SplashBackdrop({ dark }: { dark: boolean }) {
  const base = dark ? '#12160F' : '#FBFCF8';
  const orbit = dark ? '#A3D91F' : '#7FAF0C';
  const secondary = dark ? '#29331D' : '#E6EFD4';

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 390 844" width="100%">
        <Defs>
          <RadialGradient cx="50%" cy="48%" id="centerGlow" r="54%">
            <Stop offset="0%" stopColor={orbit} stopOpacity={dark ? 0.16 : 0.13} />
            <Stop offset="48%" stopColor={secondary} stopOpacity={dark ? 0.1 : 0.2} />
            <Stop offset="100%" stopColor={base} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient cx="90%" cy="4%" id="cornerGlow" r="65%">
            <Stop offset="0%" stopColor={secondary} stopOpacity={dark ? 0.26 : 0.5} />
            <Stop offset="100%" stopColor={base} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect fill={base} height="844" width="390" />
        <Rect fill="url(#cornerGlow)" height="844" width="390" />
        <Rect fill="url(#centerGlow)" height="844" width="390" />
        <Path d="M-46 514 C72 438 102 314 218 306 C303 300 356 349 438 284" fill="none" opacity={dark ? 0.1 : 0.13} stroke={orbit} strokeWidth="1" />
        <Path d="M-28 556 C95 492 139 532 220 470 C299 410 334 438 424 380" fill="none" opacity={dark ? 0.07 : 0.1} stroke={orbit} strokeWidth="1" />
        <Circle cx="66" cy="447" fill={orbit} opacity={dark ? 0.22 : 0.28} r="2.5" />
        <Circle cx="218" cy="306" fill={base} r="4" stroke={orbit} strokeOpacity={dark ? 0.24 : 0.32} strokeWidth="1" />
        <Circle cx="331" cy="426" fill={orbit} opacity={dark ? 0.18 : 0.23} r="2" />
      </Svg>
    </View>
  );
}

export default function SplashScreen() {
  const c = usePalette();
  const scheme = useAppColorScheme();
  const router = useRouter();
  const { isRestoring, session } = useAuth();
  const [motionComplete, setMotionComplete] = useState(false);
  const glyphs = useMemo(() => GLYPHS.map(() => new Animated.Value(0)), []);
  const cursor = useRef(new Animated.Value(0)).current;
  const cursorX = useRef(new Animated.Value(-130)).current;
  const merge = useRef(new Animated.Value(0)).current;
  const wordmark = useRef(new Animated.Value(0)).current;
  const tagline = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    let animation: Animated.CompositeAnimation | undefined;
    const typeGlyph = (index: number, cursorTarget: number, duration = 170) =>
      Animated.parallel([
        Animated.timing(glyphs[index], { toValue: 1, duration: 120, easing: EASE_OUT, useNativeDriver: true }),
        Animated.timing(cursorX, { toValue: cursorTarget, duration, easing: EASE_OUT, useNativeDriver: true }),
      ]);

    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!mounted) return;
      if (reduceMotion) {
        glyphs[0].setValue(1);
        glyphs[4].setValue(1);
        merge.setValue(1);
        wordmark.setValue(1);
        tagline.setValue(1);
        const timer = setTimeout(() => mounted && setMotionComplete(true), 700);
        animation = { start: () => undefined, stop: () => clearTimeout(timer), reset: () => undefined };
        return;
      }

      animation = Animated.sequence([
        Animated.delay(220),
        Animated.timing(cursor, { toValue: 1, duration: 120, easing: EASE_OUT, useNativeDriver: true }),
        typeGlyph(0, -74),
        typeGlyph(1, -24),
        Animated.delay(280),
        typeGlyph(2, 26, 130),
        typeGlyph(3, 76),
        typeGlyph(4, 126),
        Animated.delay(190),
        Animated.parallel([
          Animated.timing(merge, { toValue: 1, duration: 520, easing: EASE_IN_OUT, useNativeDriver: true }),
          Animated.timing(wordmark, { toValue: 1, duration: 280, easing: EASE_OUT, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(cursor, { toValue: 0, duration: 150, easing: EASE_OUT, useNativeDriver: true }),
            Animated.timing(cursorX, { toValue: 58, duration: 370, easing: EASE_IN_OUT, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(160),
            Animated.timing(tagline, { toValue: 1, duration: 340, easing: EASE_OUT, useNativeDriver: true }),
          ]),
        ]),
        Animated.delay(300),
      ]);
      animation.start(({ finished }) => finished && mounted && setMotionComplete(true));
    });

    return () => {
      mounted = false;
      animation?.stop();
    };
  }, [cursor, cursorX, glyphs, merge, tagline, wordmark]);

  useEffect(() => {
    if (isRestoring || !motionComplete) return;
    const target = !session ? '/(auth)/login' : session.onboardingComplete === false ? '/(onboarding)/intro' : '/(tabs)/home';
    router.replace(target);
  }, [isRestoring, motionComplete, router, session]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.screen, { backgroundColor: scheme === 'dark' ? '#12160F' : '#FBFCF8' }]}>
      <SplashBackdrop dark={scheme === 'dark'} />
      <View accessibilityLabel="하루와 이음을 이어 만든 이름, 하음. 하루의 몸 기록을 이어, 나만의 패턴을 발견해요." accessible style={styles.stage}>
        <View style={styles.typeLine}>
          <MergeSignal merge={merge} muted={c.g400} primary={c.pri} />
          {GLYPHS.map((_, index) => (
            <MotionGlyph color={index === 0 || index === 4 ? c.g900 : c.g600} index={index} key={GLYPHS[index]} merge={merge} opacity={glyphs[index]} />
          ))}
          <Animated.View
            style={[
              styles.cursor,
              {
                backgroundColor: c.pri,
                opacity: cursor,
                transform: [
                  { translateX: cursorX },
                  { scaleY: wordmark.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] }) },
                ],
              },
            ]}
          />
        </View>

        <Animated.View
          style={[
            styles.taglineWrap,
            {
              opacity: tagline,
              transform: [{ translateY: tagline.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
            },
          ]}>
          <View style={[styles.rule, { backgroundColor: c.pri }]} />
          <Text style={[styles.tagline, { color: c.g700 }]}>하루의 몸 기록을 이어,{`\n`}나만의 패턴을 발견해요</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stage: { width: '100%', height: 280, alignItems: 'center', justifyContent: 'center' },
  typeLine: { width: 300, height: 82, alignItems: 'center', justifyContent: 'center' },
  signal: { position: 'absolute', width: 1, height: 1, alignItems: 'center', justifyContent: 'center' },
  signalRing: { position: 'absolute', width: 118, height: 118, borderWidth: 1, borderRadius: 59 },
  particle: { position: 'absolute', height: 2, borderRadius: 1 },
  glyph: { position: 'absolute', fontFamily: 'Pretendard-Bold', fontSize: 56, lineHeight: 70, letterSpacing: -2.4 },
  operator: { fontFamily: 'Pretendard-Medium', fontSize: 30, lineHeight: 70 },
  cursor: { position: 'absolute', width: 3, height: 56, borderRadius: 2 },
  taglineWrap: { position: 'absolute', top: 185, alignItems: 'center' },
  rule: { width: 28, height: 2, borderRadius: 1, marginBottom: 14 },
  tagline: { fontFamily: 'Pretendard-Medium', fontSize: 16, lineHeight: 25, letterSpacing: -0.35, textAlign: 'center' },
});
