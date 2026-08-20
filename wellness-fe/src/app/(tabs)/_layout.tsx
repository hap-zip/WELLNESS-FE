import { Tabs } from 'expo-router';

import { AppTabBar } from '@/components/app-tab-bar';

/**
 * 프로토타입 탭바는 [홈] [기록] (기록하기 FAB) [커넥션] [마이] 5칸이다.
 * 중앙은 탭이 아니라 기록 플로우를 여는 FAB 이고, '챗'은 탭이 아니다 —
 * `showTabs` 는 home/records/discover/me 에서만 true 라 챗 화면엔 탭바가
 * 아예 없다. `/assistant` 스택 라우트로 따로 둔다 (`(tabs)` 밖).
 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <AppTabBar {...props} />}>
      <Tabs.Screen name="home" options={{ title: '홈' }} />
      <Tabs.Screen name="records" options={{ title: '기록' }} />
      <Tabs.Screen name="discover" options={{ title: '커넥션' }} />
      <Tabs.Screen name="me" options={{ title: '마이' }} />
    </Tabs>
  );
}
