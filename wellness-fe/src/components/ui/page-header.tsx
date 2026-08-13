import type { ReactNode } from 'react';
import type { Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import NavigationBackButton from '@/components/navigation-back-button';
import { colors, layout, spacing } from '@/theme/tokens';

export function PageHeader({ backLabel, fallbackHref, right, title }: { backLabel: string; fallbackHref: Href; right?: ReactNode; title: string }) {
  return (
    <View style={styles.header}>
      <NavigationBackButton accessibilityLabel={backLabel} fallbackHref={fallbackHref} />
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: 0,
    backgroundColor: colors.surface,
  },
  title: { flex: 1, flexShrink: 1, color: colors.text, textAlign: 'center', fontSize: 17, lineHeight: 24, fontWeight: '700', letterSpacing: -0.3 },
  right: { width: layout.minTouch, minHeight: layout.minTouch, alignItems: 'center', justifyContent: 'center' },
});
