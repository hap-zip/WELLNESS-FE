import { Image, StyleSheet, View } from 'react-native';

import { useAppColorScheme } from '@/hooks/use-app-color-scheme';

const APP_MARK = require('@/assets/images/logo/app_logo.png');
const LIGHT_WORDMARK = require('@/assets/images/logo/main.logo.light.png');
const DARK_WORDMARK = require('@/assets/images/logo/main_logo_dark.png');

export function BrandMark({ size = 32 }: { size?: number }) {
  return <Image accessibilityIgnoresInvertColors resizeMode="contain" source={APP_MARK} style={{ width: size, height: size }} />;
}

export function BrandHeaderLogo({ width = 96 }: { width?: number }) {
  const scheme = useAppColorScheme();
  return (
    <View accessibilityLabel="하음" accessible style={[styles.headerLogo, { width, height: width * 2 / 3 }]}>
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="contain"
        source={scheme === 'dark' ? DARK_WORDMARK : LIGHT_WORDMARK}
        style={{ width, height: width * 2 / 3 }}
      />
    </View>
  );
}

export function BrandWordmarkImage({ width = 280 }: { width?: number }) {
  const scheme = useAppColorScheme();
  return (
    <Image
      accessibilityLabel="하음 — 하루의 몸 기록을 이어, 나만의 패턴을 발견해요"
      accessibilityIgnoresInvertColors
      resizeMode="contain"
      source={scheme === 'dark' ? DARK_WORDMARK : LIGHT_WORDMARK}
      style={{ width, aspectRatio: 3 / 2 }}
    />
  );
}

const styles = StyleSheet.create({
  headerLogo: { justifyContent: 'center' },
});
