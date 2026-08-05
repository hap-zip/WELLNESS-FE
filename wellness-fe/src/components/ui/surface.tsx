import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, radius, spacing } from '@/theme/tokens';

type SurfaceTone = 'plain' | 'subtle' | 'inverse' | 'accent';

export function Surface({ children, style, tone = 'plain', ...props }: PropsWithChildren<ViewProps & { tone?: SurfaceTone }>) {
  return <View {...props} style={[styles.base, styles[tone], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: { padding: spacing.md, borderRadius: radius.lg },
  plain: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  subtle: { backgroundColor: colors.surfaceSubtle },
  inverse: { backgroundColor: colors.inverse },
  accent: { borderWidth: 1, borderColor: colors.primaryBorder, backgroundColor: colors.primarySoft },
});
