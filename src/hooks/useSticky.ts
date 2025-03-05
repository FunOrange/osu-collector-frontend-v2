import { useEffect, useRef, useState } from 'react';

const throttle = (func: Function, delay: number) => {
  let lastCall = 0;
  return function (...args: any[]) {
    const now = new Date().getTime();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

export default function useSticky() {
  const [isSticky, setIsSticky] = useState(false);
  const ref = useRef(null);
  let stickyElementStyleRef = useRef<CSSStyleDeclaration | null>(null);
  let stickyElementTopRef = useRef(0);

  useEffect(() => {
    const body = document.getElementById('app-root');
    const handleScroll = () => {
      if (!ref.current) return;
      const element = ref.current;
      if (!stickyElementStyleRef.current) {
        stickyElementStyleRef.current = window.getComputedStyle(element);
        stickyElementTopRef.current = parseInt(stickyElementStyleRef.current.top, 10);
      }
      setIsSticky(element.getBoundingClientRect().top <= stickyElementTopRef.current);
    };
    const throttledScroll = throttle(handleScroll, 100);
    body.addEventListener('scroll', throttledScroll);
    return () => body.removeEventListener('scroll', throttledScroll);
  }, []);

  return { isSticky, ref };
}
