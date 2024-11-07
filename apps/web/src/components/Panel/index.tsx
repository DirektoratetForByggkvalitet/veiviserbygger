import { type ReactNode, useEffect, useRef } from 'react'

import Icon from '@/components/Icon'
import Transition from '@/components/Transition'

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
}

export default function Panel({ children, open, onClose, backdrop = true, title }: Props) {
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
              <button type="button" {...bem('close')} onClick={onClose}>
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
