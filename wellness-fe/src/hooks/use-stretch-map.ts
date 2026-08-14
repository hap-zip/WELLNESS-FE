import { useEffect, useState } from 'react';

import { getAllStretches, type StretchExercise } from '@/services/exercise-gifs-api';

/** slug → 실제 스트레칭 GIF. 여러 화면이 동시에 써도 `getAllStretches` 캐시 덕에 fetch 는 한 번만 나간다. */
export function useStretchMap() {
  const [map, setMap] = useState<Record<string, StretchExercise>>({});

  useEffect(() => {
    let active = true;
    void getAllStretches().then((items) => {
      if (!active) return;
      setMap(Object.fromEntries(items.map((item) => [item.slug, item])));
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  return map;
}
