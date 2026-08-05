import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDailyCheck } from '@/context/daily-check-context';
import { AppIcon } from '@/components/app-icon';
import { colors } from '@/theme/tokens';

import { styles } from './check-complete.styles';

export default function CheckCompleteScreen() {
  const router = useRouter();
  const { completedCount, draft, resetDraft } = useDailyCheck();

  const returnHome = () => {
    resetDraft();
    router.dismissTo('/(tabs)/home');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <View style={styles.content}>
        <View accessibilityLabel="기록 완료" style={styles.checkCircle}><AppIcon color={colors.white} name="check" size={38} strokeWidth={2.4}/></View>
        <Text style={styles.eyebrow}>오늘의 기록 완료</Text>
        <Text style={styles.title}>내 몸의 오늘을{`\n`}잘 기록했어요</Text>
        <Text style={styles.description}>매일의 작은 기록이 쌓이면{`\n`}나만의 웰니스 패턴을 발견할 수 있어요.</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>기록한 항목</Text><Text style={styles.summaryValue}>{completedCount}개</Text></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>건너뛴 항목</Text><Text style={styles.summaryValue}>{draft.skippedSteps.length}개</Text></View>
        </View>
      </View>
      <View style={styles.footer}>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/check/auto')} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}><Text style={styles.editText}>기록 수정하기</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={returnHome} style={({ pressed }) => [styles.homeButton, pressed && styles.pressed]}><Text style={styles.homeText}>오늘 화면으로</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}
