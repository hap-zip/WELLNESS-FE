import { Platform } from 'react-native';

export const colors = {
  // Editorial palette: paper and ink are the canvas; only cobalt and coral carry meaning.
  background: '#F7F5F0',
  canvas: '#F7F5F0',
  surface: '#FFFDF9',
  surfaceSubtle: '#EFEEE9',
  surfaceStrong: '#E2E1DB',
  border: '#D8D6CF',
  divider: '#D8D6CF',
  text: '#1C1C1A',
  textSecondary: '#555550',
  textMuted: '#85847D',
  placeholder: '#AAA9A1',
  primary: '#2455D6',
  primaryPressed: '#1B43AE',
  primarySoft: '#E7ECFF',
  primaryBorder: '#B9C7F6',
  brand: '#2455D6',
  brandPressed: '#1B43AE',
  brandSoft: '#E7ECFF',
  brandOverlay: 'rgba(36, 85, 214, 0.14)',
  body: '#E56A4F',
  bodyPressed: '#C9523A',
  bodySoft: '#FBE8E2',
  recovery: '#2455D6',
  recoverySoft: '#E7ECFF',
  data: '#2455D6',
  dataSoft: '#E7ECFF',
  session: '#1C1C1A',
  sessionSurface: '#343431',
  sessionMuted: '#C8C7BF',
  sessionAccent: '#E56A4F',
  night: '#1C1C1A',
  nightSurface: '#343431',
  nightText: '#F8FAFC',
  nightMuted: '#AAB2C0',
  illustrationSkin: '#C9A28C',
  illustrationFabric: '#8D938A',
  success: '#2455D6',
  successSoft: '#E7ECFF',
  warning: '#E56A4F',
  warningSoft: '#FBE8E2',
  danger: '#E56A4F',
  dangerSoft: '#FBE8E2',
  disabled: '#DDE1E6',
  disabledText: '#89919B',
  scrim: 'rgba(23, 25, 28, 0.48)',
  inverse: '#17191C',
  white: '#FFFFFF',
} as const;

export const spacing = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 72 } as const;
export const radius = { sm: 4, md: 6, lg: 8, xl: 12, sheet: 18, pill: 999 } as const;
export const layout = { horizontalPadding: 20, compactHorizontalPadding: 16, controlHeight: 54, ctaHeight: 56, minTouch: 48, maxContentWidth: 620 } as const;
export const typography = {
  family: Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui' }),
  display: { fontSize: 30, lineHeight: 37, fontWeight: '700' as const, letterSpacing: -1.1 },
  title: { fontSize: 25, lineHeight: 32, fontWeight: '700' as const, letterSpacing: -0.8 },
  sectionTitle: { fontSize: 19, lineHeight: 26, fontWeight: '700' as const, letterSpacing: -0.4 },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  label: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const },
  caption: { fontSize: 13, lineHeight: 19, fontWeight: '500' as const },
} as const;

export const motion = { pressOpacity: 0.62, fast: 140, standard: 220, slow: 320 } as const;
export const iconSize = { sm: 18, md: 22, lg: 28 } as const;
export const layer = { base: 0, sticky: 10, tab: 20, sheet: 40, modal: 100 } as const;

// Data colors are presentation tokens. API responses provide values and meaning,
// while the client owns contrast-safe visualization colors.
export const dataColors = {
  sleep: '#2F6FED',
  discomfort: '#E56A4F',
  posture: '#2455D6',
  steps: '#2455D6',
  skin: '#E56A4F',
  routine: '#2455D6',
} as const;
