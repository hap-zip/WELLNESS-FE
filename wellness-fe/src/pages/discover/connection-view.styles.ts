import { StyleSheet } from 'react-native';
import { colors, layout, motion, radius, spacing, typography } from '@/theme/tokens';
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface }, content: { width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center', backgroundColor: colors.surface }, pressed: { opacity: motion.pressOpacity },
  topControls: { paddingTop: 12, paddingBottom: 18, paddingHorizontal: layout.horizontalPadding, backgroundColor: colors.surface },
  pageTitle: { minHeight: 48, color: colors.text, ...typography.title },
  controlLine: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  controlLabel: { color: colors.textSecondary, ...typography.caption, fontWeight: '700' },
  compareHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  compareCount: { color: colors.textMuted, ...typography.caption, fontWeight: '700' },
  metricChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  metricChip: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, backgroundColor: colors.surface },
  metricChipSelected: { borderColor: colors.text, backgroundColor: colors.text },
  metricChipText: { color: colors.textMuted, ...typography.caption, fontWeight: '700' },
  metricChipTextSelected: { color: colors.white },

  // 가장 중요한 발견 — 분석 도구가 아니라 결과가 페이지의 헤드라인이다.
  findingHero: { marginTop: 10, marginHorizontal: layout.horizontalPadding, padding: spacing.xl, borderWidth: 1, borderColor: colors.divider, borderRadius: radius.xl, backgroundColor: colors.surface },
  findingEyebrowRow: { minHeight: 24, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  findingEyebrow: { color: colors.textMuted, ...typography.caption, fontWeight: '600' },
  findingTitle: { marginTop: spacing.xs, maxWidth: 460, color: colors.text, fontSize: 22, lineHeight: 31, fontWeight: '700', letterSpacing: -.9 },
  findingSummary: { marginTop: spacing.sm, maxWidth: 460, color: colors.textSecondary, ...typography.body },
  findingLink: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.xs, marginTop: spacing.lg, minHeight: layout.minTouch },
  findingLinkText: { color: colors.primary, ...typography.label },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg }, progressLabel: { color: colors.textSecondary, ...typography.caption, fontWeight: '700' },
  baselineRule: { height: 6, marginTop: spacing.xs, overflow: 'hidden', borderRadius: radius.pill, backgroundColor: colors.surfaceStrong }, baselineFill: { height: 6, borderRadius: radius.pill, backgroundColor: colors.primary },

  // 기간·지표 — 분석 결과 다음으로 후퇴한 보조 컨트롤. 헤드라인과 차트 사이 거리를 최대한 좁힌다.
  controls: { marginTop: spacing.md, padding: spacing.lg, borderRadius: radius.xl, backgroundColor: colors.surface },
  chartPanel: { marginTop: 10, paddingHorizontal: layout.horizontalPadding, paddingBottom: spacing.lg, backgroundColor: colors.surface },
  controlsHead: { display: 'none' },
  controlsTitle: { color: colors.text, ...typography.titleMd },
  periods: { flexDirection: 'row', gap: spacing.xxs }, period: { minWidth: 52, minHeight: layout.minTouch, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill }, periodSelected: { borderColor: colors.text, backgroundColor: colors.text }, periodText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' }, periodTextSelected: { color: colors.white },
  metricList: { display: 'none' }, metricRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xs, borderBottomWidth: 1, borderColor: colors.divider }, metricRowSelected: { backgroundColor: colors.primarySoft }, metricDot: { width: 8, height: 8, borderRadius: radius.pill }, metricName: { flex: 1, color: colors.text, ...typography.caption, fontWeight: '700' }, metricState: { color: colors.textMuted, ...typography.caption },
  chart: { minHeight: 220, marginTop: spacing.sm, paddingVertical: spacing.sm }, chartHint: { color: colors.textMuted, ...typography.caption },

  // 근거 데이터 — 평소 상태 비교를 차트 바로 다음에 캡션 무게로.
  baselineFooter: { marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderColor: colors.border },
  baselineFooterLabel: { color: colors.textMuted, ...typography.caption, fontWeight: '700' },
  baselineFooterText: { marginTop: spacing.xs, color: colors.text, ...typography.body },

  patternSection: { marginTop: spacing.xxl, paddingTop: spacing.xl, borderTopWidth: 1, borderColor: colors.border }, patternSectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, patternSectionTitle: { color: colors.text, ...typography.titleMd }, patternCount: { color: colors.textMuted, ...typography.caption },
  pattern: { minHeight: 90, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderTopWidth: 1, borderColor: colors.divider }, patternBar: { width: 4, height: 62 }, patternCopy: { flex: 1 }, patternMeta: { color: colors.primary, ...typography.caption, fontWeight: '700' }, patternTitle: { marginTop: 3, color: colors.text, ...typography.titleMd }, patternSummary: { marginTop: 2, color: colors.textMuted, ...typography.caption },

  report: { minHeight: 76, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xxl, paddingVertical: spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border }, reportTitle: { color: colors.text, ...typography.titleMd }, reportCopy: { marginTop: 3, color: colors.textMuted, ...typography.caption },

  statusCard: { minHeight: 300, alignItems: 'center', justifyContent: 'center', gap: spacing.sm }, statusTitle: { color: colors.text, ...typography.titleLg }, statusText: { color: colors.textMuted, ...typography.caption }, retryButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, borderRadius: radius.pill, backgroundColor: colors.primary }, retryText: { color: colors.primaryText, ...typography.label },
});
