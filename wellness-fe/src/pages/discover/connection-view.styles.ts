import { StyleSheet } from 'react-native';
import { colors, layout, motion, radius, spacing, typography } from '@/theme/tokens';
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas }, content: { width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center', paddingHorizontal: layout.horizontalPadding, paddingTop: spacing.lg }, pressed: { opacity: motion.pressOpacity },

  // 가장 중요한 발견 — 분석 도구가 아니라 결과가 페이지의 헤드라인이다.
  findingHero: { paddingTop: spacing.xl, paddingBottom: spacing.lg },
  findingEyebrow: { color: colors.textMuted, ...typography.caption, fontWeight: '600' },
  findingTitle: { marginTop: spacing.xs, maxWidth: 460, color: colors.text, ...typography.displayLg },
  findingSummary: { marginTop: spacing.sm, maxWidth: 460, color: colors.textSecondary, ...typography.body },
  findingLink: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.xs, marginTop: spacing.lg, minHeight: layout.minTouch },
  findingLinkText: { color: colors.primary, ...typography.label },
  baselineRule: { height: 4, marginTop: spacing.lg, backgroundColor: colors.surfaceStrong }, baselineFill: { height: 4, backgroundColor: colors.primary },

  // 기간·지표 — 분석 결과 다음으로 후퇴한 보조 컨트롤. 헤드라인과 차트 사이 거리를 최대한 좁힌다.
  controls: { marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderColor: colors.border },
  controlsHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  controlsTitle: { color: colors.text, ...typography.titleMd },
  periods: { flexDirection: 'row', gap: spacing.xs }, period: { minWidth: 44, minHeight: 30, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill }, periodSelected: { borderColor: colors.primary, backgroundColor: colors.primary }, periodText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' }, periodTextSelected: { color: colors.white },
  metricList: { marginTop: spacing.md, borderTopWidth: 1, borderColor: colors.border }, metricRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderBottomWidth: 1, borderColor: colors.divider }, metricRowSelected: { backgroundColor: colors.primarySoft }, metricDot: { width: 8, height: 8, marginLeft: spacing.xs, borderRadius: radius.pill }, metricName: { flex: 1, color: colors.text, ...typography.caption, fontWeight: '700' }, metricState: { marginRight: spacing.sm, color: colors.textMuted, ...typography.caption },
  chart: { minHeight: 220, marginTop: spacing.sm, paddingVertical: spacing.sm }, chartHint: { color: colors.textMuted, ...typography.caption },

  // 근거 데이터 — 평소 상태 비교를 차트 바로 다음에 캡션 무게로.
  baselineFooter: { marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderColor: colors.border },
  baselineFooterLabel: { color: colors.textMuted, ...typography.caption, fontWeight: '700' },
  baselineFooterText: { marginTop: spacing.xs, color: colors.text, ...typography.body },

  patternSection: { marginTop: spacing.xxl, paddingTop: spacing.xl, borderTopWidth: 1, borderColor: colors.border }, patternSectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, patternSectionTitle: { color: colors.text, ...typography.titleMd }, patternCount: { color: colors.textMuted, ...typography.caption },
  pattern: { minHeight: 90, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderTopWidth: 1, borderColor: colors.divider }, patternBar: { width: 4, height: 62 }, patternCopy: { flex: 1 }, patternMeta: { color: colors.primary, ...typography.caption, fontWeight: '700' }, patternTitle: { marginTop: 3, color: colors.text, ...typography.titleMd }, patternSummary: { marginTop: 2, color: colors.textMuted, ...typography.caption },

  report: { minHeight: 76, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xxl, paddingVertical: spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border }, reportTitle: { color: colors.text, ...typography.titleMd }, reportCopy: { marginTop: 3, color: colors.textMuted, ...typography.caption },

  statusCard: { minHeight: 300, alignItems: 'center', justifyContent: 'center', gap: spacing.sm }, statusTitle: { color: colors.text, ...typography.titleLg }, statusText: { color: colors.textMuted, ...typography.caption }, retryButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colors.primary }, retryText: { color: colors.white, ...typography.label },
});
