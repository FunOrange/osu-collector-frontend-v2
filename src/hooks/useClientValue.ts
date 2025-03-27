import { useEffect, useState } from 'react';

export default function useClientValue<T>(func: () => Promise<T> | T, initialValue = null) {
  const [value, setValue] = useState<T>(initialValue);
  useEffect(() => {
    (async () => {
      if (typeof window !== 'undefined') {
        setValue(await func());
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}
