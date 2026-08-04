import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { styles } from './home.styles';

type HomeAvatarProps = {
  onMarkerPress: (part: 'neck' | 'shoulder') => void;
};

export default function HomeAvatar({ onMarkerPress }: HomeAvatarProps) {
  return (
    <View style={styles.avatarWrap}>
      <Svg height="212" viewBox="0 0 132 212" width="132">
        <Circle cx="66" cy="18" fill="#DDE3EA" r="12" />
        <Path
          d="M56 33c-7 8-10 21-9 39l5 38c1 9 5 16 14 16s13-7 14-16l5-38c1-18-2-31-9-39z"
          fill="#DDE3EA"
        />
        <Path d="M57 121 50 179l7 17h8l4-54 4 54h8l7-17-7-58z" fill="#DDE3EA" />
        <Path d="M49 40 29 62l5 6 24-15M83 40l20 22-5 6-24-15" fill="#DDE3EA" />
        <Path d="M45 111c8 8 34 8 42 0" fill="none" stroke="#AEB7C2" strokeWidth="2" />
      </Svg>

      <Pressable
        accessibilityLabel="목 상태 보기"
        accessibilityRole="button"
        onPress={() => onMarkerPress('neck')}
        style={[styles.avatarMarker, styles.neckMarker]}>
        <View style={[styles.markerDot, styles.neckDot]} />
      </Pressable>
      <Pressable
        accessibilityLabel="어깨 상태 보기"
        accessibilityRole="button"
        onPress={() => onMarkerPress('shoulder')}
        style={[styles.avatarMarker, styles.shoulderMarker]}>
        <View style={[styles.markerDot, styles.shoulderDot]} />
      </Pressable>

      <View pointerEvents="none" style={styles.avatarLegend}>
        <Text style={styles.legendText}>기록 있음</Text>
        <Text style={styles.legendText}>주의 필요</Text>
        <Text style={styles.legendText}>기록 없음</Text>
      </View>
    </View>
  );
}
