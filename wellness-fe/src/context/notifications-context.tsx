import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import { NOTIFICATIONS, type NotificationItem } from '@/pages/notifications/notifications.data';

type NotificationsContextValue = {
  items: NotificationItem[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

/**
 * 홈 벨 아이콘의 뱃지 숫자와 알림 목록 화면이 같은 상태를 봐야 "읽음 처리가 실제로
 * 동작한다"고 할 수 있다 — 그래서 화면 로컬 state 가 아니라 앱 전역 provider 로 뺐다.
 * API 연결 전까지는 이 in-memory 상태가 진실이다 (DailyCheckProvider 와 같은 패턴).
 */
export function NotificationsProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<NotificationItem[]>(NOTIFICATIONS);

  const markRead = useCallback((id: string) => {
    setItems((cur) => cur.map((it) => (it.id === id ? { ...it, read: true } : it)));
  }, []);
  const markAllRead = useCallback(() => {
    setItems((cur) => cur.map((it) => ({ ...it, read: true })));
  }, []);
  const clearAll = useCallback(() => setItems([]), []);

  const unreadCount = useMemo(() => items.filter((it) => !it.read).length, [items]);
  const value = useMemo(() => ({ items, unreadCount, markRead, markAllRead, clearAll }), [items, unreadCount, markRead, markAllRead, clearAll]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const value = useContext(NotificationsContext);
  if (!value) throw new Error('useNotifications must be used inside NotificationsProvider.');
  return value;
}
