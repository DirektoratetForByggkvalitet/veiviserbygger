import { useEffect } from 'react'

export default function useKeyPress(
  func: (event: KeyboardEvent) => void,
  listeners: Array<unknown> = [],
) {
  useEffect(() => {
    window.addEventListener('keydown', func)

    return () => {
      window.removeEventListener('keydown', func)
    }
  }, listeners)
}
