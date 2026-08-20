import { Platform } from 'react-native';

// Momgirok v8 foundation. Keep semantic aliases here so screens never need
// raw colours and the light/dark palette can be switched in one place later.
export const colors = {
  background: '#F1F3F5', canvas: '#F1F3F5', surface: '#FFFFFF', surfaceSubtle: '#F7F8F9', surfaceStrong: '#EFF1F3',
  border: '#D5DAE0', divider: '#EFF1F3', text: '#16191D', textSecondary: '#4A525C', textMuted: '#8B939D', placeholder: '#B3BAC3',
  primary: '#93C90F', primaryPressed: '#7FAF0C', primarySoft: '#F2F9E2', primaryBorder: '#CBE788', primaryText: '#1E2D05',
  brand: '#93C90F', brandPressed: '#7FAF0C', brandSoft: '#F2F9E2', brandOverlay: 'rgba(147, 201, 15, 0.18)',
  body: '#FF3B3B', bodyPressed: '#D91F1F', bodySoft: '#FFEBEB', recovery: '#00A98F', recoverySoft: '#E6F7F3', data: '#0A84FF', dataSoft: '#E8F3FF',
  session: '#16191D', sessionSurface: '#2A2F36', sessionMuted: '#B3BAC3', sessionAccent: '#93C90F',
  night: '#0F1113', nightSurface: '#1A1D21', nightText: '#F2F4F6', nightMuted: '#A7AEB7',
  illustrationSkin: '#FFFDF7', illustrationFabric: '#C7CDD4', success: '#00A98F', successSoft: '#E6F7F3', warning: '#A2761E', warningSoft: '#FFF6E5',
  danger: '#FF3B3B', dangerSoft: '#FFEBEB', disabled: '#D5DAE0', disabledText: '#8B939D', scrim: 'rgba(22, 25, 29, 0.48)', inverse: '#16191D', white: '#FFFFFF',
} as const;

export const darkColors = {
  ...colors,
  background:'#0F1113', canvas:'#0F1113', surface:'#1A1D21', surfaceSubtle:'#1A1D21', surfaceStrong:'#262A2F',
  border:'#343941', divider:'#262A2F', text:'#F2F4F6', textSecondary:'#C4C9D0', textMuted:'#8B939D', placeholder:'#5C636C',
  primary:'#93C90F', primaryPressed:'#A3D91F', primarySoft:'#1F2A10', primaryBorder:'#343941', primaryText:'#0F1113',
  brand:'#93C90F', brandPressed:'#A3D91F', brandSoft:'#1F2A10', body:'#FF6B6B', bodyPressed:'#FF8A8A', bodySoft:'#33201F',
  danger:'#FF6B6B', dangerSoft:'#33201F', white:'#F2F4F6', illustrationFabric:'#454B54',
} as const;

export const spacing = { xxs: 4, xs: 6, sm: 8, md: 10, lg: 14, xl: 20, xxl: 24, xxxl: 32, jumbo: 40 } as const;
export const radius = { sm: 10, md: 14, lg: 16, xl: 20, sheet: 26, pill: 999 } as const;
// v8 was authored on a 375 pt phone frame. Keep the native shell fluid across
// current phones, but stop page sections from stretching into a tablet/desktop
// layout that the handoff never specified.
export const layout = { horizontalPadding: 20, compactHorizontalPadding: 16, controlHeight: 52, ctaHeight: 54, minTouch: 44, headerHeight: 56, sectionGap: 10, sectionPadding: 20, fixedFooterSpace: 112, maxContentWidth: 430 } as const;
export const typography = {
  family: Platform.select({ ios: 'System', android: 'sans-serif', default: 'Pretendard Variable, Pretendard, system-ui' }),
  display: { fontSize: 25, lineHeight: 35, fontWeight: '700' as const, letterSpacing: -1.1 },
  title: { fontSize: 20, lineHeight: 28, fontWeight: '700' as const, letterSpacing: -0.7 },
  sectionTitle: { fontSize: 18, lineHeight: 26, fontWeight: '700' as const, letterSpacing: -0.63 },
  body: { fontSize: 14, lineHeight: 23, fontWeight: '400' as const }, label: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const, letterSpacing: -0.38 },
  caption: { fontSize: 12.5, lineHeight: 18, fontWeight: '600' as const },
  displayLg: { fontSize: 25, lineHeight: 35, fontWeight: '700' as const, letterSpacing: -1.12 }, displayMd: { fontSize: 24, lineHeight: 34, fontWeight: '700' as const, letterSpacing: -0.96 },
  titleLg: { fontSize: 20, lineHeight: 28, fontWeight: '700' as const, letterSpacing: -0.7 }, titleMd: { fontSize: 16, lineHeight: 23, fontWeight: '700' as const, letterSpacing: -0.48 },
  kicker: { fontSize: 11, lineHeight: 16, fontWeight: '700' as const, letterSpacing: 0 },
} as const;

export const motion = { pressOpacity: 0.82, fast: 120, standard: 260, slow: 450 } as const;
export const shadows = {
  subtle: { shadowColor: '#16191D', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.045, shadowRadius: 4, elevation: 1 },
  floating: { shadowColor: '#16191D', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.09, shadowRadius: 18, elevation: 4 },
} as const;
export const iconSize = { sm: 18, md: 22, lg: 28 } as const;
export const layer = { base: 0, sticky: 10, tab: 20, sheet: 40, modal: 100 } as const;
export const dataColors = { sleep: '#93C90F', discomfort: '#FF3B3B', posture: '#8B5CF6', steps: '#0A84FF', skin: '#F5A623', routine: '#00A98F' } as const;
