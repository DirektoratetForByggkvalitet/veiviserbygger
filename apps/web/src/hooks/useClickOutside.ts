/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, RefObject } from 'react'

// TODO: Fix any for event...
export default function useClickOutside(
  ref: RefObject<HTMLElement>,
  callback: (event: any) => void,
  listeners?: Array<any>,
) {
  useEffect(() => {
    // function handleClick(event: MouseEvent): void {
    function handleClick(event: any) {
      if (event.target instanceof HTMLElement && !ref.current?.contains(event.target)) {
        callback(event)
      }
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, listeners || [])
}
