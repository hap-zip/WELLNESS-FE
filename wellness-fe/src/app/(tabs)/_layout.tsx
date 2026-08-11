import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, type AppIconName } from '@/components/app-icon';
import { StyleSheet, View } from 'react-native';
import { colors, layout } from '@/theme/tokens';

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
    tabBarInactiveTintColor: colors.textMuted,
    tabBarHideOnKeyboard: true,
    tabBarItemStyle: { minHeight: layout.minTouch },
    tabBarLabelStyle: { fontSize: 11, lineHeight: 15, fontWeight: '600', marginTop: 2 },
    tabBarIconStyle: { marginTop: 3 },
    tabBarStyle: { height: 66 + insets.bottom, paddingTop: 5, paddingBottom: Math.max(insets.bottom, 7), borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider, backgroundColor: colors.surface, elevation: 0, shadowOpacity: 0 },
  }}>
    {tabs.map(tab => <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title, tabBarIcon: ({ color, focused }) => <View style={[styles.icon, focused && styles.focusedIcon]}><AppIcon color={String(color)} name={tab.icon} size={21} strokeWidth={focused ? 2.3 : 1.8}/></View> }}/>) }
  </Tabs>;
}

const styles = StyleSheet.create({
  icon: { width: 42, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  focusedIcon: { backgroundColor: colors.primarySoft },
});
