import { throttle } from 'lodash'
import { useEffect, useRef } from 'react'

type Positions = {
  startX: number | null
  startY: number | null
  diffX?: number | null
  diffY?: number | null
}

export default function useDrag(
  ref: any,
  handlers: {
    start?: (positions: Positions, event: any) => void
    move?: (positions: Positions, event: any) => void
    end?: (positions: Positions, event: any) => void
  },
  allowTouch = false,
) {
  const isTouch = useRef(false)
  const isDragging = useRef(false)
  const positions = useRef<Positions>({
    startX: null,
    startY: null,
    diffX: null,
    diffY: null,
  })

  const { start, move, end } = handlers
  const hasHandlers = !!(handlers && (start || move || end))

  const HANDLE_MOVE = throttle((event) => {
    if (isDragging.current) {
      event.preventDefault()

      const clientX = event.touches?.[0]?.clientX || event.clientX
      const clientY = event.touches?.[0]?.clientY || event.clientY

      positions.current = {
        ...positions.current,
        diffX: (positions.current.startX || 0) - clientX,
        diffY: (positions.current.startY || 0) - clientY,
      }

      if (move) {
        move({ ...positions.current }, event)
      }
    }
  }, 12)

  const HANDLE_END = (event: any) => {
    isDragging.current = false

    if (end) {
      end({ ...positions.current }, event)
    }

    positions.current = {
      startX: null,
      startY: null,
      diffX: null,
      diffY: null,
    }

    document.onmouseup = null
    document.onmousemove = null
    window.removeEventListener('touchmove', HANDLE_MOVE)
    document.ontouchend = null
  }

  const HANDLE_START = (event: any) => {
    if (isTouch.current && !allowTouch) {
      return
    }

    if (hasHandlers && !isDragging.current) {
      if (!event.touches) {
        event.preventDefault()
      }
      isDragging.current = true

      positions.current = {
        startX: event.touches?.[0]?.clientX || event.clientX,
        startY: event.touches?.[0]?.clientY || event.clientY,
      }

      if (isTouch.current) {
        window.addEventListener('touchmove', HANDLE_MOVE, {
          passive: false,
        })
        document.ontouchend = HANDLE_END
      } else {
        document.onmousemove = HANDLE_MOVE
        document.onmouseup = HANDLE_END
      }

      if (start) {
        start({ ...positions.current }, event)
      }
    }
  }

  useEffect(() => {
    if (hasHandlers) {
      isTouch.current = isTouchDevice()
      const element = ref.current

      if (isTouch.current) {
        element.addEventListener('touchstart', HANDLE_START)
      } else {
        element.addEventListener('mousedown', HANDLE_START)
      }

      return () => {
        element.removeEventListener('touchstart', HANDLE_START)
        element.removeEventListener('mousedown', HANDLE_START)
        window.removeEventListener('touchmove', HANDLE_MOVE)

        document.onmouseup = null
        document.onmousemove = null
        document.ontouchend = null
      }
    }
  })
}

function isTouchDevice() {
  return window.ontouchstart !== undefined
}
