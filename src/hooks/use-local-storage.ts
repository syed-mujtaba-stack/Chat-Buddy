'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';

// A custom hook that uses localStorage for state persistence.
export function useLocalStorage<T>(
  key: string,
  // The default value to use if there's no value in localStorage.
  defaultValue: T | null
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    // We can't access localStorage on the server, so we return the default value.
    if (typeof window === 'undefined') {
      return defaultValue as T;
    }
    try {
      const item = window.localStorage.getItem(key);
      // If there's a value in localStorage, parse it. Otherwise, use the default value.
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(error);
      return defaultValue as T;
    }
  });

  useEffect(() => {
    try {
      // When the value changes, we store it in localStorage.
      const item = JSON.stringify(value);
      window.localStorage.setItem(key, item);
    } catch (error) {
      console.error(error);
    }
  }, [key, value]);

  return [value, setValue];
}
