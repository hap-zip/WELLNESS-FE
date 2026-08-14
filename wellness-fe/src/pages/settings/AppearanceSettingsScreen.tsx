import { Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/ui/page-header';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useThemePreference } from '@/context/theme-context';
import { usePalette } from '@/theme/use-palette';
import { styles } from './settings.styles';

const OPTIONS = [
  { label: '라이트', value: 'light' },
  { label: '다크', value: 'dark' },
] as const;

export default function AppearanceSettingsScreen() {
  const insets = useSafeAreaInsets();
  const c = usePalette();
  const { scheme, setScheme } = useThemePreference();

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: c.bg }]}>
      <PageHeader backLabel="마이 화면으로 돌아가기" fallbackHref="/(tabs)/me" title="화면 모드" />
      <View style={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <View style={[styles.master, { backgroundColor: c.g100 }]}>
          <View style={styles.rowCopy}>
            <Text style={[styles.masterTitle, { color: c.g900 }]}>화면 모드</Text>
            <Text style={[styles.masterDescription, { color: c.g600 }]}>기기 설정과 상관없이 앱에서 바로 바꿀 수 있어요. 기본값은 라이트예요.</Text>
          </View>
        </View>
        <View style={{ marginTop: 16 }}>
          <SegmentedControl onChange={(value) => void setScheme(value)} options={OPTIONS} value={scheme} />
        </View>
      </View>
    </SafeAreaView>
  );
}
