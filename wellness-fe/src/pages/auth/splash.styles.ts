import { StyleSheet } from 'react-native';
import { colors, layout, spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: layout.horizontalPadding, backgroundColor: colors.session },
  top: { paddingTop: spacing.lg },
  content: { flex: 1, maxWidth: 540, justifyContent: 'center', paddingBottom: spacing.xxxl },
  title: { maxWidth: 500, color: colors.white, fontSize: 38, lineHeight: 48, fontWeight:'700', letterSpacing: -1.6 },
  description: { maxWidth: 360, marginTop: spacing.lg, color: colors.sessionMuted, ...typography.body },
  progressTrack: { height: 3, marginBottom: spacing.lg, overflow: 'hidden', backgroundColor: colors.sessionSurface },
  progressValue: { width: '100%', height: '100%', transformOrigin: 'left', backgroundColor: colors.sessionAccent },
});
