import { type ReactNode, useEffect, useRef } from 'react'

import Icon from '@/components/Icon'
import Transition from '@/components/Transition'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'

import useKeyPress from '@/hooks/useKeyPress'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

interface Props {
  children: ReactNode
  open: boolean
  onClose: () => void
  backdrop?: boolean
  title: string
  optionsLabel?: string
  options?: DropdownOptions
}

export default function Panel({
  children,
  open,
  onClose,
  backdrop = true,
  title,
  optionsLabel,
  options,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus()
    }
  }, [open])

  useKeyPress((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }, [])

  return (
    <Transition
      updateKey={open.toString()}
      {...bem('', '', open ? 'overlay' : undefined)}
      enter={500}
      exit={500}
    >
      {open && (
        <>
          <aside {...bem('panel')} ref={panelRef} tabIndex={0}>
            <header {...bem('header')}>
              <h2 {...bem('title')}>{title}</h2>
              {options && (
                <Dropdown
                  icon="Settings2"
                  direction="right"
                  options={options}
                  label={optionsLabel || 'Valg'}
                  iconOnly
                />
              )}
              <button type="button" {...bem('close')} onClick={onClose} aria-label="Lukk side">
                <Icon name="X" />
              </button>
            </header>

            <div {...bem('content')}>{children}</div>
          </aside>

          {backdrop && (
            <button type="button" aria-label="Lukk panel" {...bem('backdrop')} onClick={onClose} />
          )}
        </>
      )}
    </Transition>
  )
}

Panel.Header = function PanelHeader() {
  return <h1>Hej grabban!</h1>
}
