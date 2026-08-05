import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, type AppIconName } from '@/components/app-icon';
import { colors } from '@/theme/tokens';

const tabs: { name: 'home'|'records'|'discover'|'chat'|'me'; title: string; icon: AppIconName }[] = [
  { name: 'home', title: '홈', icon: 'home' },
  { name: 'records', title: '기록', icon: 'calendar' },
  { name: 'discover', title: '커넥션 뷰', icon: 'connection' },
  { name: 'chat', title: '챗', icon: 'message' },
  { name: 'me', title: '마이', icon: 'person' },
];

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return <Tabs screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.text,
    tabBarHideOnKeyboard: true,
    tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
    tabBarStyle: { height: 58 + insets.bottom, paddingTop: 7, paddingBottom: Math.max(insets.bottom, 7), borderTopWidth: 1, borderTopColor: colors.divider, backgroundColor: colors.white, elevation: 0, shadowOpacity: 0 },
  }}>
    {tabs.map(tab => <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title, tabBarIcon: ({ color }) => <AppIcon color={color} name={tab.icon} size={23}/> }}/>) }
  </Tabs>;
}
