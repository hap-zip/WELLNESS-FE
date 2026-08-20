import { Stack } from 'expo-router';

import { RoutineSessionProvider } from '@/context/routine-session-context';

/**
 * README: "Bottom Sheet: 부위 상세, 효과 피드백". 효과 피드백은 이전 화면
 * 위에 반투명 배경으로 떠야 하므로 투명 모달로 띄운다.
 * 오늘의 루틴→진행→완료→피드백 네 화면이 같은 세션 상태(RoutineSessionProvider)를 공유한다.
 */
export default function RoutineLayout() {
  return (
    <RoutineSessionProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="feedback" options={{ presentation: 'transparentModal', animation: 'fade' }} />
      </Stack>
    </RoutineSessionProvider>
  );
}
