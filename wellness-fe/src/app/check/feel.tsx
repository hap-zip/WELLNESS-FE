import { Redirect } from 'expo-router';

/** "강도·느낌" 은 불편 부위 선택과 한 화면으로 합쳐졌다 — 옛 딥링크만 여기로 도착한다. */
export default function FeelCheckRoute() {
  return <Redirect href="/check/discomfort" />;
}
