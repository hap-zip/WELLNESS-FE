import { StyleSheet } from 'react-native';
import { colors, layout, motion, radius, spacing, typography } from '@/theme/tokens';

// 이 파일의 이전 버전은 대화 초반 "Revolt 에디토리얼" 스킨(섹션마다 hairline
// border-top, radius 6~12의 각진 사각형, 색은 CTA 파랑 하나뿐)을 구조만 바꿔가며
// 계속 재사용했다. 이번 패스는 그 스킨 자체를 바꾼다:
// - 섹션 구분선을 전부 제거하고 whitespace(spacing.xxxl)로만 분리한다(Pillyze).
// - "묶어야 할 이유가 있는" 블록(오늘의 데이터/오늘의 루틴/최근 기록/몸 신호)은
//   radius.sheet(18)의 실제 채워진 surface로 만든다 — 선만 있던 이전과 다르다.
// - CTA 버튼은 radius.pill로 — 이전의 각진 radius.md 버튼과 형태 자체가 다르다.
// - dataStrip의 값에 처음으로 accent color(primary)를 준다 — 지금까지 색은
//   CTA 파랑 하나뿐이었다.
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center', paddingHorizontal: layout.horizontalPadding },
  pressed: { opacity: motion.pressOpacity },

  topline: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateLabel: { color: colors.textMuted, ...typography.caption },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  // 01 TODAY STATE — 여전히 bare canvas. 여기만은 선도 surface도 없어야 문장이 가장 강하다.
  state: { paddingTop: spacing.xl, paddingBottom: spacing.lg },
  stateTitle: { color: colors.text, ...typography.displayLg },
  stateSupport: { marginTop: spacing.sm, maxWidth: 380, color: colors.textSecondary, ...typography.body },
  stateLink: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.xs, marginTop: spacing.md, minHeight: layout.minTouch },
  stateLinkText: { color: colors.primary, ...typography.label },
  stateCta: { alignSelf: 'flex-start', marginTop: spacing.md, minHeight: 48, paddingHorizontal: spacing.lg, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stateCtaText: { color: colors.white, fontSize: 15, lineHeight: 20, fontWeight: '700' },

  // 02 TODAY DATA — 실제 채워진 surface(radius.sheet) + 처음으로 값에 accent color.
  dataStrip: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.xl, rowGap: spacing.md, marginTop: spacing.xxxl, padding: spacing.lg, borderRadius: radius.sheet, backgroundColor: colors.surfaceSubtle },
  dataItem: { gap: 2 },
  dataValue: { color: colors.primary, ...typography.titleMd, fontVariant: ['tabular-nums'] },
  dataCaption: { color: colors.textMuted, ...typography.caption },

  // 03 MEANINGFUL CHANGE — bare canvas, 선 없이 순수 whitespace로만 앞 섹션과 분리.
  patternBlock: { marginTop: spacing.xxxl },
  patternHeading: { color: colors.textMuted, ...typography.caption, fontWeight: '700' },
  patternSentence: { marginTop: spacing.xs, maxWidth: 420, color: colors.text, ...typography.titleLg },
  patternMeta: { marginTop: spacing.xs, color: colors.textMuted, ...typography.caption },
  patternLink: { marginTop: spacing.sm, color: colors.primary, ...typography.label },

  // 04 TODAY'S ACTION — Home에서 유일하게 채워진 큰 surface. 여기가 "행동을 시작하는 곳"임을 형태로 알린다.
  actionBlock: { marginTop: spacing.xxxl, padding: spacing.lg, borderRadius: radius.sheet, backgroundColor: colors.surfaceSubtle },
  actionHeading: { color: colors.textMuted, ...typography.caption, fontWeight: '700' },
  actionWhat: { marginTop: spacing.xs, color: colors.text, ...typography.titleLg },
  actionMeta: { marginTop: spacing.xs, color: colors.textMuted, ...typography.caption },
  actionWhy: { marginTop: spacing.sm, maxWidth: 420, color: colors.textSecondary, ...typography.body },
  actionCta: { alignSelf: 'flex-start', marginTop: spacing.md, minHeight: layout.ctaHeight, paddingHorizontal: spacing.xl, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  actionCtaText: { color: colors.white, fontSize: 16, fontWeight: '700' },

  // 몸에 남은 신호 — 이전엔 화면 폭 끝까지 닿는 각진 띠였다. 이제 다른 surface들과 같은 radius의 inset 카드.
  bodySection: { marginTop: spacing.xxxl },
  bodyLabel: { marginBottom: spacing.sm, color: colors.text, ...typography.titleMd },
  avatarFrame: { minHeight: 260, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sheet, backgroundColor: colors.surfaceSubtle },
  textAction: { minHeight: 48, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.xs, marginTop: spacing.sm },
  textActionLabel: { color: colors.body, ...typography.label },
  bodyPromptRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 52, marginTop: spacing.xxxl },
  bodyPromptText: { color: colors.textSecondary, ...typography.body },

  vectorBodyMapWrap: { width: '100%', minHeight: 260, alignItems: 'center', justifyContent: 'center' },
  bodyMapStage: { width: '100%', height: 232, alignItems: 'center', justifyContent: 'center' },
  bodyMapFigure: { width: 200, height: 228, alignItems: 'center' },
  activeTrapeziusTouchTarget: { position: 'absolute', top: 38, left: 47, width: 78, height: 57 },
  bodyMapSelection: { marginTop: spacing.sm, color: colors.text, ...typography.caption, fontWeight: '700' },
  bodyMapHint: { marginTop: 2, color: colors.textMuted, ...typography.caption },

  // 최근 기록 — 다른 surface들과 같은 언어(채워진 radius.sheet 카드) 안에서 행 구분은 hairline 대신 간격으로.
  recent: { marginTop: spacing.xxxl, padding: spacing.lg, borderRadius: radius.sheet, backgroundColor: colors.surfaceSubtle },
  recentLabel: { marginBottom: spacing.sm, color: colors.text, ...typography.titleMd },
  logRow: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logMarker: { width: 7, height: 7, borderRadius: radius.pill, backgroundColor: colors.body },
  logDate: { width: 76, color: colors.text, ...typography.caption, fontWeight: '700' },
  logValue: { flex: 1, color: colors.textSecondary, ...typography.caption },
  allLogs: { minHeight: 44, marginTop: spacing.xs, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  allLogsText: { color: colors.primary, ...typography.label },

  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { color: colors.textMuted, ...typography.caption },
  error: { flex: 1, justifyContent: 'center', paddingHorizontal: layout.horizontalPadding },
});
