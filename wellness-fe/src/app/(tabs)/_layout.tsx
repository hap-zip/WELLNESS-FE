import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { colors, layout } from '@/theme/tokens';

const tabs: { name: 'home' | 'records' | 'discover' | 'chat' | 'me'; title: string; icon: AppIconName }[] = [
  { name: 'home', title: '홈', icon: 'home' }, { name: 'records', title: '기록', icon: 'calendar' },
  { name: 'chat', title: '기록하기', icon: 'plus' }, { name: 'discover', title: '커넥션', icon: 'connection' }, { name: 'me', title: '마이', icon: 'person' },
];

export default function TabsLayout() {
  const insets = useSafeAreaInsets(); const router = useRouter();
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primaryText, tabBarInactiveTintColor: colors.textMuted, tabBarHideOnKeyboard: true, tabBarItemStyle: { minHeight: layout.minTouch }, tabBarLabelStyle: styles.label, tabBarIconStyle: styles.iconStyle, tabBarStyle: [styles.bar, { height: 54 + insets.bottom + 22, paddingBottom: insets.bottom + 12 }] }}>
    {tabs.map((tab) => <Tabs.Screen key={tab.name} name={tab.name} options={{
      title: tab.title,
      tabBarButton: tab.name === 'chat' ? () => <Pressable accessibilityLabel="오늘 기록하기" accessibilityRole="button" onPress={() => router.push('/check/auto')} style={({ pressed }) => [styles.fabSlot, pressed && styles.fabPressed]}><View pointerEvents="none" style={styles.fab}><AppIcon color={colors.primaryText} name="plus" size={24} strokeWidth={2.5} /></View></Pressable> : undefined,
      tabBarIcon: ({ color, focused }) => tab.name === 'chat' ? <View pointerEvents="none" style={styles.fab}><AppIcon color={colors.white} name="plus" size={24} strokeWidth={2.5} /></View> : <View style={[styles.icon, focused && styles.focusedIcon]}><AppIcon color={String(color)} name={tab.icon} size={21} strokeWidth={focused ? 2.2 : 1.8} /></View>,
    }} />)}
  </Tabs>;
}

const styles = StyleSheet.create({
  bar: { paddingTop: 7, borderTopWidth: 0, backgroundColor: colors.surface, elevation: 0, shadowColor: '#16191D', shadowOffset: { width: 0, height: -1 }, shadowOpacity: .05, shadowRadius: 24 },
  label: { marginTop: 1, fontSize: 10.5, lineHeight: 15, fontWeight: '500' }, iconStyle: { marginTop: 1 },
  icon: { width: 44, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 16 }, focusedIcon: { backgroundColor: colors.primarySoft },
  fabSlot: { flex: 1, minWidth: 64, alignItems: 'center', justifyContent: 'center', marginTop: -28 }, fabPressed: { opacity: .82, transform: [{ scale: .96 }] },
  fab: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 28, backgroundColor: colors.primary, borderColor: colors.white, borderWidth: 4, shadowColor: colors.primaryText, shadowOffset: { width: 0, height: 6 }, shadowOpacity: .18, shadowRadius: 14, elevation: 6 },
});
