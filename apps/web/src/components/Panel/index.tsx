import { type ReactNode, useEffect, useRef } from 'react'

import Transition from '@/components/Transition'
import Dropdown, { DropdownOptions } from '@/components/Dropdown'
import Button from '@/components/Button'

import useKeyPress from '@/hooks/useKeyPress'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

interface Props {
  children: ReactNode
  open: boolean
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
  backdrop?: boolean
  title: string
  optionsLabel?: string
  options?: DropdownOptions
}

export default function Panel({
  children,
  open,
  onClose,
  onNext,
  onPrevious,
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
              <div>
                {onPrevious && (
                  <Button icon="ArrowLeft" size="small" subtle iconOnly onClick={onPrevious}>
                    Forrige side
                  </Button>
                )}
                {onNext && (
                  <Button icon="ArrowRight" size="small" subtle iconOnly onClick={onNext}>
                    Neste side
                  </Button>
                )}
              </div>
              {options && (
                <Dropdown
                  icon="Settings2"
                  direction="right"
                  options={options}
                  label={optionsLabel || 'Valg'}
                  iconOnly
                />
              )}
              <Button onClick={onClose} icon="X" size="small" iconOnly>
                Lukk panel
              </Button>
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
