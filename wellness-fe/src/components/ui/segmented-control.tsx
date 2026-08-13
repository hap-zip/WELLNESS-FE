import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, motion, radius, spacing } from '@/theme/tokens';

export function SegmentedControl<T extends string>({ onChange, options, value }: { onChange: (value: T) => void; options: readonly { label: string; value: T }[]; value: T }) {
  return <View accessibilityRole="radiogroup" style={styles.wrap}>{options.map(option=>{const selected=option.value===value;return <Pressable accessibilityRole="radio" accessibilityState={{selected}} key={option.value} onPress={()=>onChange(option.value)} style={({pressed})=>[styles.item,selected&&styles.selected,pressed&&styles.pressed]}><Text style={[styles.label,selected&&styles.selectedLabel]}>{option.label}</Text></Pressable>})}</View>;
}

const styles=StyleSheet.create({wrap:{flexDirection:'row',gap:4,padding:4,borderRadius:radius.pill,backgroundColor:colors.surfaceStrong},item:{minHeight:44,flex:1,alignItems:'center',justifyContent:'center',paddingHorizontal:spacing.xs,borderRadius:radius.pill},selected:{backgroundColor:colors.surface},label:{flexShrink:1,color:colors.textMuted,textAlign:'center',fontSize:12.5,lineHeight:18,fontWeight:'600'},selectedLabel:{color:colors.primaryText,fontWeight:'700'},pressed:{opacity:motion.pressOpacity}});
