import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

type NavigationBackButtonProps = {
  accessibilityLabel: string;
  confirmDiscard?: boolean;
  fallbackHref: Href;
};

export default function NavigationBackButton({ accessibilityLabel, confirmDiscard = false, fallbackHref }: NavigationBackButtonProps) {
  const router = useRouter();
  const navigateBack = () => { if (router.canGoBack()) router.back(); else router.replace(fallbackHref); };
  const onPress = () => {
    if (!confirmDiscard) { navigateBack(); return; }
    Alert.alert('입력을 그만할까요?', '이 화면에서 변경한 내용은 저장되지 않아요.', [
      { text: '계속 입력', style: 'cancel' },
      { text: '나가기', style: 'destructive', onPress: navigateBack },
    ]);
  };

  return (
    <Pressable accessibilityLabel={accessibilityLabel} accessibilityRole="button" hitSlop={8} onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text accessibilityElementsHidden importantForAccessibility="no" style={styles.icon}>‹</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  icon: { color: '#17191C', fontSize: 36, fontWeight: '300', lineHeight: 38 },
  pressed: { opacity: 0.55 },
});
