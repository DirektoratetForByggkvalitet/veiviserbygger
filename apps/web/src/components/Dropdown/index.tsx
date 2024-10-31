import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { icons } from 'lucide-react'

import Icon from '@/components/Icon'
import Transition from '@/components/Transition'

import useClickOutside from '@/hooks/useClickOutside'
import useKeyPress from '@/hooks/useKeyPress'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

interface Props {
  label: string
  icon?: keyof typeof icons
  value?: string
  position?: 'above' | 'below'
  direction?: 'left' | 'right'
  options: Array<{
    value: string
    label: string
    onClick?: () => void
  }>
  onChange?: (value: string) => void
}

export default function Dropdown({
  label,
  value,
  icon,
  options,
  direction = 'left',
  position = 'below',
  onChange,
}: Props) {
  const location = useLocation()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState<boolean>(false)

  useClickOutside(wrapperRef, () => {
    if (expanded) {
      setExpanded(false)
    }
  }, [expanded])

  useEffect(() => {
    setExpanded(false)
  }, [location.pathname])

  useEffect(() => {
    if (expanded && contentRef.current) {
      contentRef.current.focus({ preventScroll: true })
    }
  }, [expanded])

  const triggerClick = () => {
    setExpanded((expanded) => !expanded)
  }

  const close = () => {
    setExpanded(false)
  }

  useKeyPress((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      close()
    }
  }, [])

  const handleOptionClick = (action: () => void) => () => {
    close()
    action()
  }

  const handleChange = (value: string) => () => {
    close()

    if (onChange) {
      onChange(value)
    }
  }

  const valueString = options.find((option) => option.value === value)?.label ?? value

  return (
    <div {...bem('')} ref={wrapperRef}>
      <button
        type="button"
        {...bem('trigger', { expanded, label: !!label })}
        onClick={triggerClick}
        ref={triggerRef}
      >
        <span {...bem('label')}>{label}</span>
        <span {...bem('value')}>{valueString ?? ' '}</span>

        <span {...bem('icon')}>{icon ? <Icon name={icon} /> : <Icon name="ChevronDown" />}</span>
      </button>

      <Transition updateKey={expanded.toString()} {...bem('animation', { expanded })}>
        {expanded && (
          <div {...bem('wrapper', [direction, position])}>
            <nav {...bem('options')}>
              {options.map((option) => {
                const handleClick = option.onClick
                  ? handleOptionClick(option.onClick)
                  : handleChange(option.value)

                return (
                  <button
                    type="button"
                    key={option.value}
                    onClick={handleClick}
                    {...bem('option', { selected: option.value === value })}
                  >
                    {option.label}
                  </button>
                )
              })}
            </nav>
          </div>
        )}
      </Transition>
    </div>
  )
}
