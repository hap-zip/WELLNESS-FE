import { Pressable, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Body, { type ExtendedBodyPart, type Slug } from 'react-native-body-highlighter';

import type { BodyMapHighlight, BodyMapPart, BodyMuscleSlug } from '@/domain/wellness';
import { colors } from '@/theme/tokens';

import { styles } from './home.styles';

type HomeAvatarProps = {
  highlights: readonly BodyMapHighlight[];
  onMarkerPress: (part: BodyMapPart) => void;
  // Visual-direction overrides — each design variant sizes/colors the body map independently.
  // Left undefined, every value falls back to the shipped Home screen's own styling.
  scale?: number;
  wrapStyle?: StyleProp<ViewStyle>;
  stageStyle?: StyleProp<ViewStyle>;
  figureStyle?: StyleProp<ViewStyle>;
  markColor?: string;
  defaultFill?: string;
  defaultStroke?: string;
  hideHint?: boolean;
  hintStyle?: StyleProp<TextStyle>;
};

const ALL_MUSCLES: readonly Slug[] = [
  'abs', 'adductors', 'ankles', 'biceps', 'calves', 'chest', 'deltoids', 'feet', 'forearm',
  'gluteal', 'hamstring', 'hands', 'hair', 'head', 'knees', 'lower-back', 'neck', 'obliques',
  'quadriceps', 'tibialis', 'trapezius', 'triceps', 'upper-back',
];

const MUSCLE_TO_PART: Readonly<Partial<Record<BodyMuscleSlug, BodyMapPart>>> = {
  abs: 'abdomen',
  biceps: 'upperArm',
  calves: 'calf',
  chest: 'chest',
  deltoids: 'shoulder',
  forearm: 'forearm',
  knees: 'knee',
  neck: 'neck',
  obliques: 'abdomen',
  quadriceps: 'thigh',
  tibialis: 'calf',
  trapezius: 'shoulder',
};

const MUSCLE_LABELS: Readonly<Record<BodyMuscleSlug, string>> = {
  abs: '복부', biceps: '위팔', calves: '종아리', chest: '가슴', deltoids: '어깨', forearm: '아래팔',
  knees: '무릎', neck: '목', obliques: '옆구리', quadriceps: '허벅지', tibialis: '정강이', trapezius: '승모근',
};

export default function HomeAvatar({ defaultFill, defaultStroke, figureStyle, hideHint, hintStyle, highlights, markColor, onMarkerPress, scale, stageStyle, wrapStyle }: HomeAvatarProps) {
  const activeMuscles = new Set<Slug>(highlights.map((highlight) => highlight.muscle));
  const mark = markColor ?? colors.body;
  const bodyData: ExtendedBodyPart[] = highlights.map((highlight) => ({
    slug: highlight.muscle,
    color: mark,
    intensity: highlight.intensity,
    styles: { fill: mark, stroke: defaultStroke ?? colors.surface, strokeWidth: 2 },
  }));
  const disabledParts = ALL_MUSCLES.filter((muscle) => !activeMuscles.has(muscle));
  const hasActiveTrapezius = activeMuscles.has('trapezius');
  const primaryHighlight = highlights[0];

  const handleMusclePress = (bodyPart: ExtendedBodyPart) => {
    if (!bodyPart.slug || !activeMuscles.has(bodyPart.slug)) return;
    const part = MUSCLE_TO_PART[bodyPart.slug as BodyMuscleSlug];
    if (part) onMarkerPress(part);
  };

  return (
    <View accessibilityLabel="기록된 근육만 선택할 수 있는 정면 바디맵" style={[styles.vectorBodyMapWrap, wrapStyle]}>
      <View style={[styles.bodyMapStage, stageStyle]}>
        <View style={[styles.bodyMapFigure, figureStyle]}>
          <Body
            border="none"
            data={bodyData}
            defaultFill={defaultFill ?? colors.surfaceStrong}
            defaultStroke={defaultStroke ?? colors.surface}
            defaultStrokeWidth={2}
            disabledParts={[...disabledParts]}
            gender="male"
            onBodyPartPress={handleMusclePress}
            scale={scale ?? 0.85}
            side="front"
          />
          {hasActiveTrapezius ? <Pressable accessibilityLabel="어깨와 승모근 기록 보기" accessibilityRole="button" onPress={() => onMarkerPress('shoulder')} style={styles.activeTrapeziusTouchTarget} /> : null}
        </View>
      </View>
      {primaryHighlight?<Text style={styles.bodyMapSelection}>{MUSCLE_LABELS[primaryHighlight.muscle]} · 불편 {primaryHighlight.intensity}단계</Text>:null}
      {hideHint ? null : <Text style={[styles.bodyMapHint, hintStyle]}>{highlights.length > 0 ? '색이 표시된 근육을 눌러보세요' : '기록된 불편 부위가 없어요'}</Text>}
    </View>
  );
}
