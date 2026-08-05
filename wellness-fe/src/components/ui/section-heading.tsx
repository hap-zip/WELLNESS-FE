import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '@/components/app-icon';
import { colors, layout, motion, spacing, typography } from '@/theme/tokens';

export function SectionHeading({ actionLabel, description, onAction, title }: { actionLabel?: string; description?: string; onAction?: () => void; title: string }) {
  return <View style={styles.row}><View style={styles.copy}><Text accessibilityRole="header" style={styles.title}>{title}</Text>{description ? <Text style={styles.description}>{description}</Text> : null}</View>{actionLabel && onAction ? <Pressable accessibilityRole="button" onPress={onAction} style={({pressed})=>[styles.action,pressed&&styles.pressed]}><Text style={styles.actionText}>{actionLabel}</Text><AppIcon color={colors.textMuted} name="chevron-right" size={16}/></Pressable> : null}</View>;
}

const styles=StyleSheet.create({row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:spacing.sm},copy:{flex:1},title:{color:colors.text,...typography.sectionTitle},description:{marginTop:spacing.xxs,color:colors.textMuted,...typography.caption},action:{minHeight:layout.minTouch,flexDirection:'row',alignItems:'center',gap:spacing.xxs,paddingLeft:spacing.sm},actionText:{color:colors.textSecondary,fontSize:13,fontWeight:'700'},pressed:{opacity:motion.pressOpacity}});
