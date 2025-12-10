import { MouseEventHandler, ReactElement, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { icons } from 'lucide-react'

import Icon from '@/components/Icon'
import Transition from '@/components/Transition'

import useClickOutside from '@/hooks/useClickOutside'
import { useEditable } from '@/hooks/useEditable'
import useKeyPress from '@/hooks/useKeyPress'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'

const bem = BEMHelper(styles)

export type DropdownOptions = Array<
  | {
      value: string
      label: string
      icon?: keyof typeof icons
      onClick?: MouseEventHandler
      styled?: 'delete'
      selected?: boolean
      disabled?: boolean
    }
  | { group: string; icon?: keyof typeof icons }
>

type Props = {
  label?: string
  placeholder?: string
  icon?: keyof typeof icons
  value?: string | number | boolean
  position?: 'above' | 'below'
  direction?: 'left' | 'right'
  sentence?: boolean
  simple?: boolean
  subtle?: boolean
  hideLabel?: boolean
  iconOnly?: boolean
  trigger?: (props: { onClick: MouseEventHandler }) => ReactElement
  options: DropdownOptions
  onChange?: (value: string) => void
}

export default function Dropdown({
  label,
  value,
  placeholder,
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
  subtle,
}: Props) {
  const location = useLocation()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState<boolean>(false)
  const isEditable = useEditable()

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
  const valueString =
    selectedOption && 'label' in selectedOption
      ? selectedOption?.label
      : value || placeholder || label

  if (!isEditable && iconOnly) {
    return null
  }

  if (!isEditable) {
    return (
      <div {...bem('', { simple, subtle, sentence, 'read-only': true })} ref={wrapperRef}>
        <div {...bem('trigger', { label: !!label })}>
          {label && !iconOnly && !hideLabel && <span {...bem('label')}>{label}</span>}
          <span {...bem('value')}>{valueString || ' '}</span>
        </div>
      </div>
    )
  }

  return (
    <div {...bem('', { simple, subtle, sentence, iconOnly })} ref={wrapperRef}>
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
          {!iconOnly && (
            <span {...bem('value', { placeholder: !selectedOption && !value && placeholder })}>
              {valueString || ' '}
            </span>
          )}

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

                      {option?.icon && (
                        <span {...bem('group-icon')}>
                          <Icon name={option.icon} />
                        </span>
                      )}
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
                      selected: option.selected || option.value === value,
                      [option.styled ?? '']: !!option.styled,
                      disabled: option?.disabled,
                    })}
                  >
                    {option?.icon && (
                      <span {...bem('option-icon')}>
                        <Icon name={option.icon} />
                      </span>
                    )}
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
