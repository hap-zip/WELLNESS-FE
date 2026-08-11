import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, radius, spacing } from '@/theme/tokens';

type SurfaceTone = 'plain' | 'subtle' | 'inverse' | 'accent';

export function Surface({ children, style, tone = 'plain', ...props }: PropsWithChildren<ViewProps & { tone?: SurfaceTone }>) {
  return <View {...props} style={[styles.base, styles[tone], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: { padding: spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  plain: { backgroundColor: colors.surface },
  subtle: { backgroundColor: colors.surfaceSubtle },
  inverse: { backgroundColor: colors.inverse, borderColor: colors.inverse },
  accent: { backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder },
});
