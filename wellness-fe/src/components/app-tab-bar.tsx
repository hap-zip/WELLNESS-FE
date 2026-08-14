import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckGlyph, TabGlyph, type TabGlyphName } from '@/components/tab-glyph';
import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';

/**
 * `Momgirok v8.dc.html` → `tabbarStyle` + `tabs[]` 를 그대로 옮긴 것.
 *
 *   nav      padding:6px 4px 22px; border-top:1px solid g200;
 *            box-shadow:0 -1px 24px rgba(22,25,29,.05)
 *   button   flex:1; min-height:54px; justify-content:flex-end
 *   iconWrap 44×30 radius 16, 활성 배경 priLightest
 *   FAB      54×54 radius 28, margin-top:-26, border:4px solid card
 *   label    10.5px / 활성·중앙 700 : 500 / letter-spacing:-.02em
 *
 * 하단 22 는 SafeArea 를 포함하지 않은 값이므로 insets.bottom 을 따로 더한다.
 */

type Tab = { name: string; label: string; glyph: TabGlyphName };

const LEFT: Tab[] = [
  { name: 'home', label: '홈', glyph: 'home' },
  { name: 'records', label: '기록', glyph: 'records' },
];

const RIGHT: Tab[] = [
  { name: 'discover', label: '커넥션', glyph: 'discover' },
  { name: 'me', label: '마이', glyph: 'me' },
];

const labelStyle = text({ size: 10.5, weight: 700, tracking: -0.02 });
const labelStyleIdle = text({ size: 10.5, weight: 500, tracking: -0.02 });

export function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const c = usePalette();
  const dark = useAppColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const activeName = state.routes[state.index]?.name;

  const go = (name: string) => () => {
    const route = state.routes.find((r) => r.name === name);
    if (!route) return;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(route.name);
  };

  const renderTab = (tab: Tab) => {
    const active = activeName === tab.name;
    return (
      <Pressable
        key={tab.name}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={tab.label}
        onPress={go(tab.name)}
        style={styles.button}>
        <View style={[styles.iconWrap, active && { backgroundColor: c.priLightest }]}>
          <TabGlyph active={active} name={tab.glyph} />
        </View>
        <Text style={[active ? labelStyle : labelStyleIdle, styles.label, { color: active ? c.priDk : c.g500 }]}>
          {tab.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: 22 + insets.bottom,
          borderTopColor: c.g200,
          // backdrop-filter 는 RN 에 없다. 원본 알파가 .97 이라 블러가 거의 드러나지
          // 않으므로 같은 rgba 를 그대로 쓴다.
          backgroundColor: dark ? 'rgba(26,29,33,.97)' : 'rgba(255,255,255,.97)',
        },
      ]}>
      {LEFT.map(renderTab)}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="오늘 기록하기"
        onPress={() => router.push('/check/auto')}
        style={styles.button}>
        <View style={[styles.fab, { backgroundColor: c.pri, borderColor: dark ? '#1A1D21' : '#fff' }]}>
          <CheckGlyph />
        </View>
        <Text style={[labelStyle, styles.centerLabel, { color: c.g800 }]}>기록하기</Text>
      </Pressable>

      {RIGHT.map(renderTab)}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    // 프로토타입은 position:absolute 로 스크롤 영역 위에 떠 있다. 각 화면 끝의
    // 112px 여백이 그 전제 위에 있는 값이라 여기서도 흐름 밖으로 빼야 한다.
    position: 'absolute',
    left: 0, right: 0, bottom: 0, zIndex: 6,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 6,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    // box-shadow:0 -1px 24px rgba(22,25,29,.05)
    ...Platform.select({
      ios: { shadowColor: '#16191D', shadowOffset: { width: 0, height: -1 }, shadowOpacity: 0.05, shadowRadius: 24 },
      android: { elevation: 8 },
      default: { boxShadow: '0 -1px 24px rgba(22,25,29,.05)' },
    }),
  },
  button: { flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'flex-end' },
  iconWrap: { width: 44, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  label: { marginTop: 4 },
  centerLabel: { marginTop: 6 },
  fab: {
    width: 54, height: 54, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    marginTop: -26, borderWidth: 4,
    // box-shadow:0 6px 16px rgba(147,201,15,.30), 0 2px 4px rgba(22,25,29,.10)
    ...Platform.select({
      ios: { shadowColor: '#93C90F', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16 },
      android: { elevation: 6 },
      default: { boxShadow: '0 6px 16px rgba(147,201,15,.30), 0 2px 4px rgba(22,25,29,.10)' },
    }),
  },
});
