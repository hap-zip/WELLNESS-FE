import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon, type AppIconName } from '@/components/app-icon';
import { colors, layout, motion, radius, spacing, typography } from '@/theme/tokens';

function noticeIcon(icon: string | undefined, tone: 'neutral'|'error'|'success'): AppIconName {
  if (tone === 'error' || icon === '!') return 'alert';
  if (tone === 'success' || icon === '✓') return 'check';
  if (icon === '＋') return 'plus';
  return 'info';
}

export default function StateNotice({ actionLabel, description, icon, onAction, title, tone='neutral' }: { actionLabel?: string; description: string; icon?: string; onAction?: () => void; title: string; tone?: 'neutral'|'error'|'success' }) {
  const iconColor=tone==='error'?colors.danger:tone==='success'?colors.success:colors.textSecondary;
  return <View accessibilityRole="summary" style={styles.wrap}><View style={[styles.icon,tone==='error'&&styles.errorIcon,tone==='success'&&styles.successIcon]}><AppIcon color={iconColor} name={noticeIcon(icon,tone)} size={24}/></View><Text style={styles.title}>{title}</Text><Text style={styles.description}>{description}</Text>{actionLabel&&onAction?<Pressable accessibilityRole="button" onPress={onAction} style={({pressed})=>[styles.button,pressed&&styles.pressed]}><Text style={styles.buttonText}>{actionLabel}</Text></Pressable>:null}</View>;
}
const styles=StyleSheet.create({wrap:{alignItems:'center',justifyContent:'center',paddingVertical:spacing.xxl,borderTopWidth:1,borderBottomWidth:1,borderColor:colors.divider},icon:{width:44,height:44,alignItems:'center',justifyContent:'center',borderRadius:22,backgroundColor:colors.surfaceStrong},errorIcon:{backgroundColor:colors.dangerSoft},successIcon:{backgroundColor:colors.successSoft},title:{marginTop:spacing.sm,color:colors.text,fontSize:17,lineHeight:24,fontWeight:'700'},description:{maxWidth:280,marginTop:spacing.xs,textAlign:'center',color:colors.textMuted,...typography.caption},button:{minWidth:120,minHeight:layout.minTouch,alignItems:'center',justifyContent:'center',marginTop:spacing.md,paddingHorizontal:spacing.md,borderRadius:radius.md,backgroundColor:colors.primary},buttonText:{color:colors.white,fontSize:13,fontWeight:'700'},pressed:{opacity:motion.pressOpacity}});
