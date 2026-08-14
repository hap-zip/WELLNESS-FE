import { Pressable, StyleSheet, Text, View } from 'react-native';
import { motion, radius, spacing } from '@/theme/tokens';
import { usePalette } from '@/theme/use-palette';

export function SegmentedControl<T extends string>({ onChange, options, value }: { onChange: (value: T) => void; options: readonly { label: string; value: T }[]; value: T }) {
  const c = usePalette();
  return <View accessibilityRole="radiogroup" style={[styles.wrap,{backgroundColor:c.g200}]}>{options.map(option=>{const selected=option.value===value;return <Pressable accessibilityRole="radio" accessibilityState={{selected}} key={option.value} onPress={()=>onChange(option.value)} style={({pressed})=>[styles.item,selected&&{backgroundColor:c.card},pressed&&styles.pressed]}><Text style={[styles.label,{color:selected?c.g900:c.g600},selected&&styles.selectedLabel]}>{option.label}</Text></Pressable>})}</View>;
}

const styles=StyleSheet.create({wrap:{flexDirection:'row',gap:4,padding:4,borderRadius:radius.pill},item:{minHeight:44,flex:1,alignItems:'center',justifyContent:'center',paddingHorizontal:spacing.xs,borderRadius:radius.pill},label:{flexShrink:1,textAlign:'center',fontSize:12.5,lineHeight:18,fontWeight:'600'},selectedLabel:{fontWeight:'700'},pressed:{opacity:motion.pressOpacity}});
