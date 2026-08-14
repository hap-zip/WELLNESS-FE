import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

const FILL_EASE = Easing.bezier(0.23, 1, 0.32, 1);

export function AnimatedProgressFill({
  progress,
  style,
}: {
  progress: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduceMotion = useReducedMotion();
  const target = Math.max(0, Math.min(1, progress));
  const scale = useSharedValue(reduceMotion ? target : 0);

  useFocusEffect(useCallback(() => {
    scale.value = reduceMotion ? target : 0;
    if (!reduceMotion) {
      scale.value = withDelay(120, withTiming(target, { duration: 500, easing: FILL_EASE }));
    }
    return () => cancelAnimation(scale);
  }, [reduceMotion, scale, target]));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: scale.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ transformOrigin: 'left center' }, style, animatedStyle]}
    />
  );
}
