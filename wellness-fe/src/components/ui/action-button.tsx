import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, layout, motion, radius, spacing } from '@/theme/tokens';

type Tone = 'primary' | 'secondary' | 'danger' | 'text';

export function ActionButton({ accessibilityLabel, children, disabled, loading, onPress, tone = 'primary' }: PropsWithChildren<{ accessibilityLabel?: string; disabled?: boolean; loading?: boolean; onPress: () => void; tone?: Tone }>) {
  const inactive=disabled||loading;
  return <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" accessibilityState={{disabled:inactive,busy:loading}} disabled={inactive} onPress={onPress} style={({pressed})=>[styles.base,styles[tone],inactive&&styles.disabled,pressed&&styles.pressed]}>{loading?<ActivityIndicator color={tone==='primary'?colors.white:colors.primary}/>:<Text style={[styles.label,styles[`${tone}Label`]]}>{children}</Text>}</Pressable>;
}

const styles=StyleSheet.create({base:{minHeight:layout.ctaHeight,alignItems:'center',justifyContent:'center',paddingHorizontal:spacing.md,borderRadius:radius.md},primary:{backgroundColor:colors.primary},secondary:{borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},danger:{backgroundColor:colors.dangerSoft},text:{backgroundColor:'transparent'},label:{fontSize:15,fontWeight:'800'},primaryLabel:{color:colors.white},secondaryLabel:{color:colors.text},dangerLabel:{color:colors.danger},textLabel:{color:colors.textSecondary},disabled:{opacity:.38},pressed:{opacity:motion.pressOpacity}});
