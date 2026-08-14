import { useThemePreference } from '@/context/theme-context';

/**
 * v8 화면(팔레트·탭바)이 따라야 할 색 모드. 기기 시스템 설정이 아니라
 * 마이 > 화면 모드에서 고른 값이다 — `react-native` 의 `useColorScheme()` 과 혼동하지 말 것.
 */
export function useAppColorScheme() {
  return useThemePreference().scheme;
}
