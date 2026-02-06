import { useState, useEffect, useCallback } from 'react';

const ROTATION_INTERVAL = 10000; // 10 seconds

interface UseRotationResult<T> {
  current: T | null;
  index: number;
  next: () => void;
  prev: () => void;
  total: number;
}

export function useRotation<T>(items: T[]): UseRotationResult<T> {
  const [index, setIndex] = useState(0);
  const [lastInteraction, setLastInteraction] = useState(0);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % items.length);
    setLastInteraction(Date.now());
  }, [items.length]);

  const prev = useCallback(() => {
    setIndex((prev) => (prev - 1 + items.length) % items.length);
    setLastInteraction(Date.now());
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) {
      setIndex(0);
      return;
    }

    const interval = setInterval(() => {
      // Only auto-rotate if no recent manual interaction (3 seconds grace period)
      if (Date.now() - lastInteraction > 3000) {
        setIndex((prev) => (prev + 1) % items.length);
      }
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [items.length, lastInteraction]);

  // Reset index if it's out of bounds
  useEffect(() => {
    if (index >= items.length) {
      setIndex(0);
    }
  }, [index, items.length]);

  return {
    current: items.length > 0 ? items[index] : null,
    index,
    next,
    prev,
    total: items.length
  };
}
