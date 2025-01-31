import { useDebounce } from '@uidotdev/usehooks'
import { isEqual } from 'lodash'
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
export function useSortableList<T extends { id: string | number }>(
  value: T[],
  onChange: (list: T[]) => void,
  debounceMs = 150,
) {
  // keep the local value
  const [localValue, setLocalValue] = useState(value)

  // debounce the value before calling the onChange
  const debouncedValue = useDebounce(localValue, debounceMs)

  const handleSort = (itemId: string | number, newIndex: number) =>
    setLocalValue((v) => {
      const itemIndex = localValue.findIndex((v) => v.id === itemId)

      if (itemIndex === -1) {
        return v
      }

      const without = v.filter((v) => v.id !== itemId)

      return [...without.slice(0, newIndex), v[itemIndex], ...without.slice(newIndex)]
    })

  // update the value if the debounced value is different
  useEffect(() => {
    // if the values have different lengths, something was added or removed
    // so we update the local value to discard the order change. Without this
    // a newly added item would be discarded since the the local value is not
    // in sync with the value prop and the old value would be persisted.
    if (value.length !== localValue.length) {
      setLocalValue(value)
      return
    }

    if (isEqual(value, debouncedValue)) {
      return
    }

    onChange(debouncedValue)
  }, [debouncedValue, value])

  return {
    value: localValue,
    inSync: isEqual(value, localValue),
    onSort: handleSort,
  }
}
