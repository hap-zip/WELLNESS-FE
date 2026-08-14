import { Redirect } from 'expo-router';

/**
 * v8 은 기간·항목 선택과 미리보기·공유가 한 화면(`ReportSetupScreen`)에 있다.
 * 예전에는 두 단계 라우트였지만, 실제로 이 경로를 직접 여는 곳이 없어졌으므로
 * 설정 화면으로 보낸다.
 */
export default function ReportPreviewRoute() {
  return <Redirect href="/reports/setup" />;
}
