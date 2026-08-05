import { useCallback, useEffect, useState } from 'react';

export function useAsyncData<T>(loader: () => Promise<T>, initialValue: T) {
  const [data, setData] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const value = await loader();
      setData(value);
      return value;
    } catch (reason) {
      const nextError = reason instanceof Error ? reason : new Error('데이터를 불러오지 못했습니다.');
      setError(nextError);
      throw nextError;
    } finally {
      setIsLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);
    void loader()
      .then((value) => { if (mounted) setData(value); })
      .catch((reason) => { if (mounted) setError(reason instanceof Error ? reason : new Error('데이터를 불러오지 못했습니다.')); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [loader]);

  return { data, error, isLoading, reload };
}
