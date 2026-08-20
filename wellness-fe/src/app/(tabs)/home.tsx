import { useLocalSearchParams } from 'expo-router';

import HomeScreen from '@/pages/home/HomeScreen';
import type { HomeState } from '@/pages/home/home.data';

const STATES: HomeState[] = ['done', 'empty', 'syncing', 'error'];

export default function HomeRoute() {
  // 홈은 4상태로 갈린다. 실제 상태는 기록·동기화 결과에서 나오지만, 개발 중에는
  // `/home?state=empty` 처럼 직접 열어 각 상태를 확인할 수 있게 둔다.
  const { state } = useLocalSearchParams<{ state?: string }>();
  const override = __DEV__ && STATES.includes(state as HomeState) ? (state as HomeState) : undefined;

  return <HomeScreen state={override} />;
}
