import { useDebounce } from '@uidotdev/usehooks'
import { intersection, isEqualWith } from 'lodash'
import { ReactHTMLElement, useEffect, useState } from 'react'

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
    if (isEqualWith(value, debouncedValue)) {
      return
    }

    onChange(debouncedValue)
  }, [debouncedValue, value])

  return {
    value: localValue,
    inSync: value === localValue,
    onSort: handleSort,
  }
}
