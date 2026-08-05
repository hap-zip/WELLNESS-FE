import { Platform } from 'react-native';

export const colors = {
  background: '#FFFFFF',
  canvas: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSubtle: '#F7F7F5',
  surfaceStrong: '#F1F2EF',
  border: '#DDE0DC',
  divider: '#ECEEEC',
  text: '#171A18',
  textSecondary: '#4E5551',
  textMuted: '#7A817D',
  primary: '#176B52',
  primaryPressed: '#115640',
  primarySoft: '#EFF6F3',
  primaryBorder: '#CFE2DA',
  success: '#34765B',
  successSoft: '#E7F0EB',
  warning: '#98612D',
  warningSoft: '#F5ECE1',
  danger: '#B54745',
  dangerSoft: '#F7E8E6',
  scrim: 'rgba(24, 32, 28, 0.52)',
  inverse: '#1D2924',
  white: '#FFFFFF',
} as const;

export const spacing = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40 } as const;
export const radius = { sm: 4, md: 8, lg: 10, xl: 12, sheet: 20, pill: 999 } as const;
export const layout = { horizontalPadding: 20, compactHorizontalPadding: 16, controlHeight: 50, ctaHeight: 54, minTouch: 44, maxContentWidth: 560 } as const;
export const typography = {
  family: Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui' }),
  display: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const, letterSpacing: -0.8 },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  sectionTitle: { fontSize: 18, lineHeight: 26, fontWeight: '700' as const, letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 23, fontWeight: '400' as const },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '700' as const },
  caption: { fontSize: 12, lineHeight: 18, fontWeight: '500' as const },
} as const;

export const motion = { pressOpacity: 0.62, fast: 140, standard: 220, slow: 320 } as const;
export const iconSize = { sm: 18, md: 22, lg: 28 } as const;
export const layer = { base: 0, sticky: 10, tab: 20, sheet: 40, modal: 100 } as const;

// Data colors are presentation tokens. API responses provide values and meaning,
// while the client owns contrast-safe visualization colors.
export const dataColors = {
  sleep: '#285C4D',
  discomfort: '#B54745',
  posture: '#98612D',
  steps: '#4F7162',
  skin: '#8B6258',
  routine: '#59645D',
} as const;
