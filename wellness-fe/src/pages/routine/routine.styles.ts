import { StyleSheet } from 'react-native';
import { colors, layout, motion, radius, spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.canvas},
  topBar:{minHeight:56,flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:spacing.sm,paddingVertical:spacing.xxs,backgroundColor:colors.surface},topTitle:{flex:1,flexShrink:1,color:colors.text,textAlign:'center',fontSize:17,lineHeight:24,fontWeight:'700'},topSpacer:{width:layout.minTouch},
  content:{width:'100%',maxWidth:layout.maxContentWidth,alignSelf:'center',paddingHorizontal:layout.horizontalPadding,paddingTop:spacing.lg},center:{flex:1,alignItems:'center',justifyContent:'center',padding:spacing.xl,backgroundColor:colors.canvas},loadingText:{marginTop:spacing.sm,color:colors.textMuted,...typography.caption},errorTitle:{color:colors.text,...typography.sectionTitle},retryButton:{minWidth:110,minHeight:layout.minTouch,alignItems:'center',justifyContent:'center',marginTop:spacing.md,borderRadius:radius.md,backgroundColor:colors.primarySoft},retryText:{color:colors.primary,...typography.label},

  // 지금 해야 할 행동 — 카드 없이 canvas 위에, illustration이 실제 행동을 크게 보여준다.
  hero:{paddingTop:spacing.lg,paddingBottom:spacing.xl},
  context:{color:colors.textMuted,...typography.caption,fontWeight:'700'},
  reason:{marginTop:spacing.xs,maxWidth:420,color:colors.textSecondary,...typography.body},
  heroVisual:{alignItems:'center',marginTop:spacing.lg},
  stepTitle:{marginTop:spacing.lg,textAlign:'center',color:colors.text,...typography.displayMd},
  stepInstruction:{marginTop:spacing.sm,alignSelf:'center',maxWidth:380,textAlign:'center',color:colors.textSecondary,...typography.body},
  meta:{marginTop:spacing.lg,textAlign:'center',color:colors.textMuted,...typography.caption},

  // 다음 순서 — 동일한 카드를 반복하지 않는, 작은 순서 목록.
  upcoming:{marginTop:spacing.xxl,paddingTop:spacing.xl,borderTopWidth:1,borderColor:colors.border},
  upcomingTitle:{marginBottom:spacing.xs,color:colors.text,...typography.titleMd},
  upcomingRow:{minHeight:44,flexDirection:'row',alignItems:'center',gap:spacing.sm,borderTopWidth:StyleSheet.hairlineWidth,borderColor:colors.divider},
  upcomingIndex:{width:20,color:colors.textMuted,fontSize:12,fontWeight:'700'},
  upcomingStepTitle:{flex:1,color:colors.text,fontSize:14,lineHeight:20,fontWeight:'600'},
  upcomingTime:{color:colors.textMuted,fontSize:12,fontWeight:'600'},

  // 시작 전 확인 — 별도 surface나 강조선 없이 경고색 아이콘 + 텍스트만으로 구분한다.
  caution:{flexDirection:'row',alignItems:'flex-start',gap:spacing.xs,marginTop:spacing.xl},
  cautionText:{flex:1,color:colors.textSecondary,fontSize:13,lineHeight:19},

  bottomAction:{position:'absolute',right:0,bottom:0,left:0,paddingHorizontal:layout.horizontalPadding,paddingTop:spacing.sm,borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:colors.divider,backgroundColor:colors.surface},primaryButton:{minHeight:layout.ctaHeight,alignItems:'center',justifyContent:'center',borderRadius:radius.md,backgroundColor:colors.primary},primaryText:{color:colors.white,fontSize:16,fontWeight:'700'},pressed:{opacity:motion.pressOpacity},
});
