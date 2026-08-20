import { useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/**
 * 헤더가 스크린 상단에 고정된 화면에서, 콘텐츠가 헤더 아래로 스크롤되기 시작하면
 * 헤더에 옅은 그림자를 붙이기 위한 훅. 임계값(2px)을 넘나들 때만 상태를 바꿔서
 * 스크롤마다 리렌더가 나지 않게 한다.
 */
export function useScrollElevation(threshold = 2) {
  const [elevated, setElevated] = useState(false);
  const last = useRef(false);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = e.nativeEvent.contentOffset.y > threshold;
    if (next !== last.current) { last.current = next; setElevated(next); }
  };
  return { elevated, onScroll };
}

export const headerShadow = {
  shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
} as const;
