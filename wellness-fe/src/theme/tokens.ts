import { Platform } from 'react-native';

export const colors = {
  background: '#FFFFFF',
  surface: '#F7F8FA',
  surfaceStrong: '#EEF1F5',
  border: '#E3E6EA',
  text: '#17191C',
  textSecondary: '#4A4F58',
  textMuted: '#8B919B',
  primary: '#1257E0',
  primarySoft: '#EAF0FE',
  danger: '#E03131',
  white: '#FFFFFF',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 10, md: 12, lg: 16, xl: 20, pill: 999 } as const;
export const layout = { horizontalPadding: 24, controlHeight: 52, ctaHeight: 56, minTouch: 44 } as const;
export const typography = {
  family: Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui' }),
  title: { fontSize: 28, lineHeight: 38, fontWeight: '800' as const, letterSpacing: -0.8 },
  body: { fontSize: 15, lineHeight: 23, fontWeight: '400' as const },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '700' as const },
} as const;
