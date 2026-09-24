/* useDebounce - delay value changes (for search inputs, expensive lists) */
'use client';

import { useEffect, useState } from 'react';

export default function useDebounce(value, delayMs = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
