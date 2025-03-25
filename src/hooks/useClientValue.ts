import { useEffect, useState } from 'react';

export default function useClientValue<T>(func: () => T, initialValue = null) {
  const [value, setValue] = useState<T>(initialValue);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setValue(func());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}
