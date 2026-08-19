import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme/tokens';
import { BrandHeaderLogo } from '@/components/brand-logo';

export function BrandWordmark({ inverse: _inverse = false }: { inverse?: boolean }) {
  return <View accessibilityLabel="하음" accessible style={styles.wordmark}><BrandHeaderLogo width={126}/></View>;
}

export type OnboardingScene = 'record' | 'connect' | 'act';

export function OnboardingSceneVisual({ scene }: { scene: OnboardingScene }) {
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.visual}><Svg height="100%" viewBox="0 0 320 230" width="100%">
    {scene === 'record' ? <>
      <Rect fill={colors.surfaceSubtle} height="182" rx="4" width="246" x="37" y="24"/>
      <Circle cx="69" cy="57" fill={colors.body} r="9"/><Rect fill={colors.text} height="12" rx="2" width="122" x="88" y="51"/>
      <Line stroke={colors.border} strokeWidth="2" x1="68" x2="252" y1="91" y2="91"/><Line stroke={colors.border} strokeWidth="2" x1="68" x2="252" y1="124" y2="124"/><Line stroke={colors.border} strokeWidth="2" x1="68" x2="252" y1="157" y2="157"/>
      <Path d="M70 91c18-18 32 18 50 0s32 18 50 0 32 18 50 0 24 8 32 0" fill="none" stroke={colors.body} strokeLinecap="round" strokeWidth="4"/>
      <Circle cx="220" cy="157" fill={colors.recovery} r="7"/>
    </> : null}
    {scene === 'connect' ? <>
      <Circle cx="83" cy="70" fill={colors.brandSoft} r="38"/><Circle cx="238" cy="70" fill={colors.bodySoft} r="38"/><Circle cx="160" cy="172" fill={colors.recoverySoft} r="38"/>
      <Path d="M112 89 142 145M209 90l-29 55M121 70h79" fill="none" stroke={colors.border} strokeWidth="3"/>
      <Path d="M65 72h10l8-18 12 33 9-15h12" fill="none" stroke={colors.brand} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"/>
      <Path d="M218 70c8-13 27-6 20 8-5 9-15 14-15 14s-12-6-16-15c-5-12 7-19 11-7Z" fill={colors.body}/>
      <Path d="M143 173h34M160 156v34" stroke={colors.recovery} strokeLinecap="round" strokeWidth="5"/>
    </> : null}
    {scene === 'act' ? <>
      <Rect fill={colors.session} height="172" rx="5" width="246" x="37" y="28"/>
      <Path d="M80 151c24-45 52-68 82-68 29 0 48 17 79 54" fill="none" opacity=".35" stroke={colors.sessionAccent} strokeWidth="2"/>
      <Circle cx="160" cy="106" fill="none" r="38" stroke={colors.sessionMuted} strokeWidth="5"/>
      <Path d="M160 78v30l19 13" fill="none" stroke={colors.white} strokeLinecap="round" strokeWidth="5"/>
      <Rect fill={colors.sessionAccent} height="8" rx="4" width="92" x="114" y="169"/>
    </> : null}
  </Svg></View>;
}

const styles = StyleSheet.create({
  wordmark: { flexDirection: 'row', alignItems: 'center' },
  visual: { width: '100%', aspectRatio: 320 / 230 },
});
