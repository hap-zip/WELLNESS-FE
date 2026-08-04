import { useCallback, useEffect, useState } from 'react';

export function useAsyncData<T>(loader: () => Promise<T>, initialValue: T) {
  const [data, setData] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const value = await loader();
      setData(value);
      return value;
    } finally {
      setIsLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    void loader().then((value) => { if (mounted) setData(value); }).finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [loader]);

  return { data, isLoading, reload };
}
