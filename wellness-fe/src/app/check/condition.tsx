import { Redirect } from 'expo-router';

/** "오늘 컨디션" 은 자동 수집과 한 화면으로 합쳐졌다 — 옛 딥링크만 여기로 도착한다. */
export default function ConditionCheckRoute() {
  return <Redirect href="/check/auto" />;
}
