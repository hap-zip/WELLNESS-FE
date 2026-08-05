import { Platform } from 'react-native';

export const colors = {
  background: '#FFFFFF',
  canvas: '#F5F6F8',
  surface: '#FFFFFF',
  surfaceSubtle: '#F5F6F8',
  surfaceStrong: '#ECEFF3',
  border: '#DDE2E8',
  divider: '#E9ECF0',
  text: '#17191C',
  textSecondary: '#465163',
  textMuted: '#687180',
  primary: '#175CD3',
  primaryPressed: '#1249AA',
  primarySoft: '#EAF1FD',
  success: '#267A52',
  successSoft: '#E9F5EF',
  warning: '#A85418',
  warningSoft: '#FFF1E7',
  danger: '#C9363E',
  dangerSoft: '#FCEBED',
  scrim: 'rgba(17, 24, 39, 0.48)',
  inverse: '#182033',
  white: '#FFFFFF',
} as const;

export const spacing = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, sheet: 28, pill: 999 } as const;
export const layout = { horizontalPadding: 24, controlHeight: 52, ctaHeight: 56, minTouch: 44 } as const;
export const typography = {
  family: Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui' }),
  title: { fontSize: 28, lineHeight: 38, fontWeight: '800' as const, letterSpacing: -0.8 },
  sectionTitle: { fontSize: 20, lineHeight: 28, fontWeight: '800' as const, letterSpacing: -0.3 },
  body: { fontSize: 15, lineHeight: 23, fontWeight: '400' as const },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '700' as const },
  caption: { fontSize: 12, lineHeight: 18, fontWeight: '500' as const },
} as const;

export const motion = { pressOpacity: 0.66, fast: 160, standard: 240 } as const;
