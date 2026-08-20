import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout, spacing, typography } from '@/theme/tokens';

export default function PendingTabScreen({ title, description }: { title: string; description: string }) {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={{ flex: 1, width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center', paddingHorizontal: layout.horizontalPadding, paddingTop: spacing.xxl }}>
        <Text style={{ color: colors.text, ...typography.title }}>{title}</Text>
        <View style={{ marginTop: spacing.xl, paddingVertical: spacing.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.divider }}>
          <Text style={{ color: colors.textSecondary, ...typography.body }}>{description}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
