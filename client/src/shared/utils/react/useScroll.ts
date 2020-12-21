import { useRef, useEffect, DependencyList } from 'react';

export const useScroll = <T extends HTMLElement>(
  options?: boolean | ScrollIntoViewOptions,
  deps?: DependencyList,
) => {
  const scrollToRef = useRef<T>(null);
  const scrollTo = () => {
    scrollToRef.current && scrollToRef.current.scrollIntoView(options);
  };

  useEffect(scrollTo, deps);

  return scrollToRef;
};
