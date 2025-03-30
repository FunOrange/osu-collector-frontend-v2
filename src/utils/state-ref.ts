import { useState, useRef } from 'react';

export default function useStateRef<T>(initialValue: T) {
  // useState for re-rendering
  const [state, setState] = useState(initialValue);
  // useRef for stable reference
  const ref = useRef(initialValue);

  const getValue = () => ref.current;
  const setValue = (newValue: T | ((prevState: T) => T)) => {
    // @ts-ignore:next-line
    const newState = typeof newValue === 'function' ? newValue(ref.current) : newValue;
    ref.current = newState;
    setState(newState);
  };
  return [getValue, setValue] as const;
}
