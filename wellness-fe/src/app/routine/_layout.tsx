import { Stack } from 'expo-router';

/**
 * README: "Bottom Sheet: 부위 상세, 효과 피드백". 효과 피드백은 이전 화면
 * 위에 반투명 배경으로 떠야 하므로 투명 모달로 띄운다.
 */
export default function RoutineLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="feedback" options={{ presentation: 'transparentModal', animation: 'fade' }} />
    </Stack>
  );
}
