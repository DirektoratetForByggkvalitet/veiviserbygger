import { useDebounce } from '@uidotdev/usehooks'
import { RefObject, useEffect, useState } from 'react'

/**
 * Value hook that debounces the value before calling the onChange, while
 * keeping the local value in sync with the value prop and providing a flag
 * to indicate if the value is in sync. The local value is updated instantly
 * while the debounced value is updated after debunceMs (default 150ms).
 *
 * This is useful when you want to debounce the value before calling the
 * onChange, while keeping the local value in sync with the value prop.
 *
 * @param value
 * @param onChange
 * @returns
 */
export function useValue<T extends string | number>(
  value: T | undefined,
  onChange: (v: T | undefined) => void,
  ref?: RefObject<HTMLInputElement>,
  debounceMs = 150,
) {
  // keep the local value
  const [localValue, setLocalValue] = useState(value)

  // keep track of the focus state
  const [focused, setFocused] = useState(false)

  // debounce the value before calling the onChange
  const debouncedValue = useDebounce(localValue, debounceMs)

  useEffect(() => {
    const onFocus = () => setFocused(true)
    const onBlur = () => setFocused(false)

    // set up focus/blur listeners
    ref?.current?.addEventListener('focus', onFocus)
    ref?.current?.addEventListener('focusout', onBlur)

    // clean up listeners
    return () => {
      ref?.current?.removeEventListener('focus', onFocus)
      ref?.current?.removeEventListener('focusout', onBlur)
    }
  })

  // update the internal value if the value prop changes and the
  // field is not in focus (meaning the change was a result of a
  // different user changing the value)
  useEffect(() => {
    if (!focused && value !== localValue) {
      setLocalValue(value)
    }
  }, [focused, value, debouncedValue])

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
