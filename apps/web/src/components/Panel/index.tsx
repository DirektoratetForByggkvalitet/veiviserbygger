import { type ReactNode, useEffect, useRef } from 'react'

import Transition from '@/components/Transition'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

interface Props {
  children: ReactNode
  open: boolean
  onClose: () => void
}

export default function Panel({ children, open, onClose }: Props) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && contentRef.current) {
      contentRef.current.focus()
    }
  }, [open])

  return (
    <Transition
      updateKey={open.toString()}
      {...bem('', '', open ? 'overlay' : undefined)}
      enter={300}
      exit={300}
    >
      {open && (
        <>
          <div {...bem('content')} ref={contentRef} tabIndex={0}>
            {children}
          </div>

          <button type="button" aria-label="Lukk panel" {...bem('backdrop')} onClick={onClose} />
        </>
      )}
    </Transition>
  )
}

Panel.Header = function PanelHeader() {
  return <h1>Hej grabban!</h1>
}
