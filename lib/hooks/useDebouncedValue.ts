import { useEffect, useState } from 'react';

/**
 * Hook to debounce a value for performance optimization.
 * Useful for search inputs, text areas, etc.
 * 
 * @param value - The value to debounce
 * @param delayMs - Delay in milliseconds (default: 250ms)
 * @returns The debounced value
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebouncedValue(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // This only runs 500ms after user stops typing
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
