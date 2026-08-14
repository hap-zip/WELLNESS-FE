import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HkGlyph, MonthPrevGlyph, StateIconGlyph } from '@/components/glyphs';
import { useNotifications } from '@/context/notifications-context';
import { text } from '@/theme/typography';
import { usePalette } from '@/theme/use-palette';
import type { Palette } from '@/theme/palette';
import type { NotificationItem } from './notifications.data';

/**
 * 홈 화면 알림 벨을 눌렀을 때 실제로 뜨는 알림 목록.
 * v8 프로토타입에 없던 화면이라 기존 팔레트·타이포·아이콘·행 카드 패턴만 그대로
 * 가져다 새로 구성했다. 읽음 처리·모두 읽음·지우기는 로컬 상태로 실제로 동작한다
 * — API 연결 전까지 이 상태가 진실이다.
 */
export default function NotificationsScreen() {
  const c = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, unreadCount, markRead, markAllRead, clearAll } = useNotifications();

  const openItem = (it: NotificationItem) => {
    markRead(it.id);
    if (it.route.startsWith('/(tabs)/')) router.dismissTo(it.route as never);
    else router.replace(it.route as never);
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'));

  return (
    <SafeAreaView edges={['top']} style={[s.screen, { backgroundColor: c.bg }]}>
      <View style={[s.header, { backgroundColor: c.card, borderBottomColor: c.g200 }]}>
        <Pressable accessibilityLabel="이전 화면으로 돌아가기" accessibilityRole="button" onPress={goBack} style={s.backBtn}>
          <MonthPrevGlyph color={c.g800} size={20} />
        </Pressable>
        <Text style={[text({ size: 16, weight: 700, tracking: -0.03 }), s.flex1, { color: c.g900 }]}>알림</Text>
        {items.length > 0 ? (
          <Pressable accessibilityRole="button" disabled={unreadCount === 0} onPress={markAllRead} style={s.markAllBtn}>
            <Text style={[text({ size: 12.5, weight: 700 }), { color: unreadCount === 0 ? c.g300 : c.priDk }]}>모두 읽음</Text>
          </Pressable>
        ) : null}
      </View>

      {items.length === 0 ? (
        <View style={s.emptyWrap}>
          <View style={[s.emptyIconWrap, { backgroundColor: c.g100 }]}>
            <StateIconGlyph color={c.g500} id="plus" />
          </View>
          <Text style={[text({ size: 16, weight: 700, tracking: -0.03 }), s.emptyTitle, { color: c.g900 }]}>알림이 없어요</Text>
          <Text style={[text({ size: 12.5, leading: 1.6 }), s.emptyBody, { color: c.g500 }]}>새로운 소식이 오면 여기에 쌓여요.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false}>
          <View style={s.list}>
            {items.map((it) => (
              <NotificationRow c={c} it={it} key={it.id} onPress={() => openItem(it)} />
            ))}
          </View>

          <Pressable accessibilityRole="button" onPress={clearAll} style={s.clearBtn}>
            <Text style={[text({ size: 12.5, weight: 700 }), { color: c.g500 }]}>모두 지우기</Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function NotificationRow({ c, it, onPress }: { c: Palette; it: NotificationItem; onPress: () => void }) {
  const iconBg = it.read ? c.g100 : c.priLightest;
  const iconColor = it.read ? c.g500 : c.priDk;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !it.read }}
      onPress={onPress}
      style={({ pressed }) => [s.row, { borderColor: c.g200, backgroundColor: it.read ? c.card : c.priLightest + '55' }, pressed && s.rowPressed]}>
      <View style={[s.rowIcon, { backgroundColor: iconBg }]}>
        <HkGlyph color={iconColor} id={it.icon} size={19} />
      </View>
      <View style={s.flex1}>
        <View style={s.rowHead}>
          <Text style={[text({ size: 14, weight: 700, tracking: -0.03, leading: 1.4 }), s.flex1, { color: c.g900 }]}>{it.title}</Text>
          {!it.read ? <View style={[s.unreadDot, { backgroundColor: c.pri }]} /> : null}
        </View>
        <Text style={[text({ size: 12.5, leading: 1.55 }), s.rowBody, { color: c.g600 }]}>{it.body}</Text>
        <Text style={[text({ size: 11, weight: 600 }), s.rowTime, { color: c.g400 }]}>{it.timeLabel}</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1, minWidth: 0 },

  header: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 2, paddingLeft: 8, paddingRight: 16, borderBottomWidth: 1 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  markAllBtn: { height: 44, justifyContent: 'center', paddingHorizontal: 4 },

  list: { paddingHorizontal: 20, paddingTop: 14, gap: 8 },
  row: { flexDirection: 'row', gap: 12, padding: 14, borderWidth: 1, borderRadius: 16 },
  rowPressed: { opacity: 0.7 },
  rowIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  unreadDot: { marginTop: 5, width: 7, height: 7, borderRadius: 4 },
  rowBody: { marginTop: 3 },
  rowTime: { marginTop: 7 },

  clearBtn: { marginTop: 4, height: 44, alignItems: 'center', justifyContent: 'center' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIconWrap: { width: 56, height: 56, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 16 },
  emptyBody: { marginTop: 6, textAlign: 'center' },
});
