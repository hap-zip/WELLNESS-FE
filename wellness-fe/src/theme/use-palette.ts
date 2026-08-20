import { useAppColorScheme } from '@/hooks/use-app-color-scheme';
import { darkPalette, lightPalette, type Palette } from '@/theme/palette';

/**
 * 프로토타입의 `this.palette()` 에 대응한다. 화면에서 `const c = usePalette()` 로
 * 받아 `c.g900` 처럼 쓰면 프로토타입 CSS 와 이름이 그대로 맞는다.
 *
 * 기기 시스템 설정이 아니라 마이 > 화면 모드에서 고른 값을 따른다.
 */
export function usePalette(): Palette {
  return useAppColorScheme() === 'dark' ? darkPalette : lightPalette;
}
