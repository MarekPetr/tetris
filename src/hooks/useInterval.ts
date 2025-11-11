import { useEffect, useRef } from 'react';

export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(() => {});

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const intervalTick = () => {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = window.setInterval(intervalTick, delay);
      return () => window.clearInterval(id);
    }
  }, [delay]);
};