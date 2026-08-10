import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon, type AppIconName } from '@/components/app-icon';
import { colors, layout, motion, radius, spacing, typography } from '@/theme/tokens';

function noticeIcon(icon: string | undefined, tone: 'neutral'|'error'|'success'): AppIconName {
  if (tone === 'error' || icon === '!') return 'alert';
  if (tone === 'success' || icon === '✓') return 'check';
  if (icon === '＋') return 'plus';
  return 'info';
}

export default function StateNotice({ actionLabel, description, icon, onAction, onSecondaryAction, secondaryActionLabel, title, tone='neutral' }: { actionLabel?: string; description: string; icon?: string; onAction?: () => void; onSecondaryAction?: () => void; secondaryActionLabel?: string; title: string; tone?: 'neutral'|'error'|'success' }) {
  const iconColor=tone==='error'?colors.danger:tone==='success'?colors.success:colors.textSecondary;
  return <View accessibilityLiveRegion={tone==='error'?'polite':'none'} accessibilityRole="summary" style={styles.wrap}><View style={[styles.icon,tone==='error'&&styles.errorIcon,tone==='success'&&styles.successIcon]}><AppIcon color={iconColor} name={noticeIcon(icon,tone)} size={24}/></View><Text style={styles.title}>{title}</Text><Text style={styles.description}>{description}</Text>{actionLabel&&onAction?<Pressable accessibilityRole="button" onPress={onAction} style={({pressed})=>[styles.button,pressed&&styles.pressed]}><Text style={styles.buttonText}>{actionLabel}</Text></Pressable>:null}{secondaryActionLabel&&onSecondaryAction?<Pressable accessibilityRole="button" onPress={onSecondaryAction} style={({pressed})=>[styles.secondaryButton,pressed&&styles.pressed]}><Text style={styles.secondaryButtonText}>{secondaryActionLabel}</Text></Pressable>:null}</View>;
}
const styles=StyleSheet.create({wrap:{alignItems:'center',justifyContent:'center',paddingVertical:spacing.xxxl},icon:{width:40,height:40,alignItems:'center',justifyContent:'center'},errorIcon:{},successIcon:{},title:{marginTop:spacing.sm,color:colors.text,fontSize:18,lineHeight:26,fontWeight:'700'},description:{maxWidth:320,marginTop:spacing.xs,textAlign:'center',color:colors.textMuted,...typography.caption},button:{minWidth:152,minHeight:layout.minTouch,alignItems:'center',justifyContent:'center',marginTop:spacing.lg,paddingHorizontal:spacing.md,borderRadius:radius.md,backgroundColor:colors.primary},buttonText:{color:colors.white,fontSize:14,fontWeight:'700'},secondaryButton:{minWidth:152,minHeight:layout.minTouch,alignItems:'center',justifyContent:'center',paddingHorizontal:spacing.md},secondaryButtonText:{color:colors.text,fontSize:14,fontWeight:'700'},pressed:{opacity:motion.pressOpacity}});
