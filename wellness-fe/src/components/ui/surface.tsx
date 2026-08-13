import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, layout, spacing } from '@/theme/tokens';

type SurfaceTone = 'plain' | 'subtle' | 'inverse' | 'accent';

export function Surface({ children, style, tone = 'plain', ...props }: PropsWithChildren<ViewProps & { tone?: SurfaceTone }>) {
  return <View {...props} style={[styles.base, styles[tone], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: { paddingVertical: spacing.xl, paddingHorizontal: layout.horizontalPadding, backgroundColor: colors.surface },
  plain: { backgroundColor: colors.surface },
  subtle: { backgroundColor: colors.surfaceSubtle },
  inverse: { backgroundColor: colors.inverse, borderColor: colors.inverse },
  accent: { backgroundColor: colors.primarySoft },
});
