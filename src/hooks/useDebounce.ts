import { useCallback, useRef } from 'react';

export default function useDebouncedFunction<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutRef = useRef<NodeJS.Timeout | null>(null);
  return useCallback(
    (...args: Parameters<T>) => {
      clearTimeout(timeoutRef.current!);
      timeoutRef.current = setTimeout(() => func(...args), delay);
    },
    [func, delay],
  );
}
