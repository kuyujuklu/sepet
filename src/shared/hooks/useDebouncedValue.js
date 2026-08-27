import { useEffect, useState } from "react";

// Holds the previous value until `value` has stopped changing for `delayMs` -
// unlike useDeferredValue (which only deprioritizes a render, so it still
// settles on every keystroke), this genuinely waits for a pause in typing
// before the caller sees the new value at all.
export const useDebouncedValue = (value, delayMs) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);

    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
};
