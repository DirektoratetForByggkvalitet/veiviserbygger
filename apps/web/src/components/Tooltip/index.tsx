import { useRef, useState } from 'react'
import BEMHelper from '@/lib/bem'
import Icon from '@/components/Icon'
import Transition from '@/components/Transition'
import styles from './Styles.module.scss'

type TooltipPosition = 'above' | 'below'
type TooltipDirection = 'left' | 'right'

const bem = BEMHelper(styles)

interface TooltipProps {
  text: string
  position?: TooltipPosition
  direction?: TooltipDirection
}

export default function Tooltip({ text, position = 'below', direction = 'left' }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const tooltipId = `tooltip-${Math.random().toString(36).slice(2, 10)}`

  const handleClick = () => setOpen((v) => !v)
  const handleBlur = () => setOpen(false)

  return (
    <span {...bem('')} ref={wrapperRef}>
      <button
        type="button"
        {...bem('icon')}
        onClick={handleClick}
        onBlur={handleBlur}
        ref={btnRef}
        aria-label="Vis info"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        aria-controls={tooltipId}
      >
        <Icon name="Info" />
      </button>
      <Transition updateKey={open.toString()} {...bem('animation', { open })}>
        {open && (
          <span {...bem('popup', [direction, position])} role="tooltip" id={tooltipId}>
            {text}
          </span>
        )}
      </Transition>
    </span>
  )
}
