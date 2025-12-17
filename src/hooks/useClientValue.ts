import { useEffect, useState } from 'react';

export default function useClientValue<TClient>(clientValue: () => TClient): TClient | undefined;
export default function useClientValue<TClient>(clientValue: () => TClient, serverValue: TClient): TClient;
export default function useClientValue<TClient>(
  clientValue: () => TClient,
  serverValue?: TClient,
): TClient | undefined {
  const [value, setValue] = useState<TClient | undefined>(serverValue);
  useEffect(() => {
    setValue(clientValue());
  }, []);
  return value;
}
