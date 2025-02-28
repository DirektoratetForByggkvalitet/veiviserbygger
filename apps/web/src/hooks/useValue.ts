import { useDebounce } from '@uidotdev/usehooks'
import { useEffect, useState } from 'react'

/**
 * Value hook that debounces the value before calling the onChange, while
 * keeping the local value in sync with the value prop and providing a flag
 * to indicate if the value is in sync. The local value is updated instantly
 * while the debounced value is updated after the debounceMs.
 *
 * This is useful when you want to debounce the value before calling the
 * onChange, while keeping the local value in sync with the value prop.
 *
 * @param value
 * @param onChange
 * @param debounceMs
 * @returns
 */
export function useValue<T extends string | number>(
  value: T,
  onChange: (v: T) => void,
  debounceMs = 150,
) {
  // keep the local value
  const [localValue, setLocalValue] = useState(value)

  // debounce the value before calling the onChange
  const debouncedValue = useDebounce(localValue, debounceMs)

  // update the value if the debounced value is different
  useEffect(() => {
    if (value !== debouncedValue) {
      onChange(debouncedValue)
    }
  }, [debouncedValue])

  return {
    value: localValue,
    inSync: value === localValue,
    onChange: setLocalValue,
  }
}
