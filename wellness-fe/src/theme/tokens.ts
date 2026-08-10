import { Platform } from 'react-native';

export const colors = {
  background: '#FFFFFF',
  canvas: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSubtle: '#F6F7F9',
  surfaceStrong: '#ECEFF3',
  border: '#E1E5EA',
  divider: '#EDF0F3',
  text: '#17191C',
  textSecondary: '#454B54',
  textMuted: '#737B86',
  placeholder: '#9AA1AA',
  primary: '#2F6FED',
  primaryPressed: '#2459C8',
  primarySoft: '#EDF3FF',
  primaryBorder: '#C9D9FA',
  brand: '#2F6FED',
  brandPressed: '#2459C8',
  brandSoft: '#EDF3FF',
  brandOverlay: 'rgba(47, 111, 237, 0.14)',
  body: '#E5544B',
  bodyPressed: '#C7443C',
  bodySoft: '#FDEDEC',
  recovery: '#23846B',
  recoverySoft: '#E9F5F1',
  data: '#2F6FED',
  dataSoft: '#EDF3FF',
  session: '#10261F',
  sessionSurface: '#1C3B31',
  sessionMuted: '#B4CBC3',
  sessionAccent: '#81D2B5',
  night: '#111827',
  nightSurface: '#273043',
  nightText: '#F8FAFC',
  nightMuted: '#AAB2C0',
  illustrationSkin: '#C9A28C',
  illustrationFabric: '#8D938A',
  success: '#23846B',
  successSoft: '#E9F5F1',
  warning: '#A26A18',
  warningSoft: '#FBF2E4',
  danger: '#D44848',
  dangerSoft: '#FDECEC',
  disabled: '#DDE1E6',
  disabledText: '#89919B',
  scrim: 'rgba(23, 25, 28, 0.48)',
  inverse: '#17191C',
  white: '#FFFFFF',
} as const;

export const spacing = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 40, xxxl: 56 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, sheet: 24, pill: 999 } as const;
export const layout = { horizontalPadding: 20, compactHorizontalPadding: 16, controlHeight: 54, ctaHeight: 56, minTouch: 48, maxContentWidth: 620 } as const;
export const typography = {
  family: Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui' }),
  display: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const, letterSpacing: -0.8 },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const, letterSpacing: -0.6 },
  sectionTitle: { fontSize: 20, lineHeight: 28, fontWeight: '700' as const, letterSpacing: -0.3 },
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
  discomfort: '#E5544B',
  posture: '#8B6D4A',
  steps: '#23846B',
  skin: '#B47763',
  routine: '#23846B',
} as const;
