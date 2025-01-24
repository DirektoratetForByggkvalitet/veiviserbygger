import { useEffect, useRef, useState, ReactElement, MouseEventHandler } from 'react'
import { useLocation } from 'react-router-dom'

import { icons } from 'lucide-react'

import Icon from '@/components/Icon'
import Transition from '@/components/Transition'

import useClickOutside from '@/hooks/useClickOutside'
import useKeyPress from '@/hooks/useKeyPress'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

export type DropdownOptions = Array<
  | {
    value: string
    label: string
    onClick?: MouseEventHandler
    styled?: 'delete'
    disabled?: boolean
  }
  | { group: string }
>

type Props = {
  label?: string
  icon?: keyof typeof icons
  value?: string
  position?: 'above' | 'below'
  direction?: 'left' | 'right'
  sentence?: boolean
  simple?: boolean
  hideLabel?: boolean
  iconOnly?: boolean
  trigger?: (props: { onClick: MouseEventHandler }) => ReactElement
  options: DropdownOptions
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
  hideLabel,
  iconOnly,
  trigger,
  sentence,
  simple,
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

  const getPositionWithoutCollissions = () => {
    const wrapperRect = wrapperRef?.current?.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    if (wrapperRect && wrapperRect.bottom + 100 > viewportHeight)
      return position === 'below' ? 'above' : position
    if (wrapperRect && wrapperRect.top - 100 < 0) return position === 'above' ? 'below' : position
    return position
  }
  const endPosition = getPositionWithoutCollissions()

  const selectedOption = options.find((option) => 'value' in option && option.value === value)
  const valueString = selectedOption && 'label' in selectedOption ? selectedOption?.label : value

  return (
    <div {...bem('', { simple, sentence, iconOnly })} ref={wrapperRef}>
      {trigger ? (
        trigger({ onClick: triggerClick })
      ) : (
        <button
          type="button"
          {...bem('trigger', { expanded, label: !!label })}
          onClick={triggerClick}
          aria-label={iconOnly ? label : undefined}
          title={iconOnly ? label : undefined}
          ref={triggerRef}
        >
          {label && !iconOnly && !hideLabel && <span {...bem('label')}>{label}</span>}
          {!iconOnly && <span {...bem('value')}>{valueString || ' '}</span>}

          <span {...bem('icon')}>{icon ? <Icon name={icon} /> : <Icon name="ChevronDown" />}</span>
        </button>
      )}

      <Transition updateKey={expanded.toString()} {...bem('animation', { expanded })}>
        {expanded && (
          <div {...bem('wrapper', [direction, endPosition])}>
            <nav {...bem('options')}>
              {options.map((option) => {
                if ('group' in option) {
                  return (
                    <span key={option.group} {...bem('option-group')}>
                      {option.group}
                    </span>
                  )
                }
                const handleClick = option.onClick
                  ? handleOptionClick(option.onClick as () => void)
                  : handleChange(option.value)

                return (
                  <button
                    type="button"
                    key={option.value}
                    disabled={option?.disabled}
                    onClick={handleClick}
                    {...bem('option', {
                      selected: option.value === value,
                      [option.styled ?? '']: !!option.styled,
                      disabled: option?.disabled,
                    })}
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
