const easeInOutQuad = (time: number, b: number, c: number, d: number) => {
  let t = time
  t = t / (d / 2)
  if (t < 1) {
    return (c / 2) * t * t + b
  }
  t--
  return (-c / 2) * (t * (t - 2) - 1) + b
}

export function getPosition(element: HTMLElement) {
  const scrollTop =
    window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop

  return element.getBoundingClientRect().top + scrollTop
}

export default function scrollToPos(
  to: number,
  duration = 300,
  element?: HTMLElement,
): Promise<void> {
  const wrapper = element || document.body
  wrapper.style.pointerEvents = 'none'
  wrapper.style.willChange = 'scroll-position'

  const start = element
    ? element.scrollTop
    : window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop

  const change = to - start
  const increment = 20
  let currentTime = 0

  return new Promise((resolve) => {
    const animateScroll = () => {
      currentTime += increment

      const val = easeInOutQuad(currentTime, start, change, duration)
      if (element) {
        element.scrollTop = val
      } else {
        window.scrollTo(0, val)
      }

      if (currentTime < duration) {
        setTimeout(animateScroll, increment)
      } else {
        wrapper.style.pointerEvents = 'auto'
        wrapper.style.willChange = 'auto'
        resolve()
      }
    }

    animateScroll()
  })
}
