import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, layout, motion, radius, spacing } from '@/theme/tokens';

export function SegmentedControl<T extends string>({ onChange, options, value }: { onChange: (value: T) => void; options: readonly { label: string; value: T }[]; value: T }) {
  return <View accessibilityRole="radiogroup" style={styles.wrap}>{options.map(option=>{const selected=option.value===value;return <Pressable accessibilityRole="radio" accessibilityState={{selected}} key={option.value} onPress={()=>onChange(option.value)} style={({pressed})=>[styles.item,selected&&styles.selected,pressed&&styles.pressed]}><Text style={[styles.label,selected&&styles.selectedLabel]}>{option.label}</Text></Pressable>})}</View>;
}

const styles=StyleSheet.create({wrap:{flexDirection:'row',gap:spacing.xs,paddingVertical:spacing.xxs,borderBottomWidth:1,borderColor:colors.border},item:{minHeight:layout.minTouch,flex:1,alignItems:'center',justifyContent:'center',paddingHorizontal:spacing.xs,borderBottomWidth:2,borderBottomColor:'transparent'},selected:{borderBottomColor:colors.primary},label:{flexShrink:1,color:colors.textMuted,textAlign:'center',fontSize:13,lineHeight:18,fontWeight:'700'},selectedLabel:{color:colors.primary,fontWeight:'800'},pressed:{opacity:motion.pressOpacity}});
