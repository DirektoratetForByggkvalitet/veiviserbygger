import { useAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import menuState from '@/store/menu'

import Icon from '@/components/Icon'
import Transition from '@/components/Transition'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

export default function Menu() {
  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useAtom(menuState)

  const closeMenu = () => {
    setOpen(false)
  }

  useEffect(() => {
    if (open && menuRef.current) {
      menuRef.current.focus()
    }
  }, [open])

  return (
    <Transition updateKey={open.toString()} {...bem('')} enter={300} exit={300}>
      {open && (
        <>
          <nav {...bem('content')} ref={menuRef} tabIndex={0}>
            <Link to="/" {...bem('item')}>
              <span {...bem('label')}>Bruksendring</span>
            </Link>
            <Link to="/" {...bem('item')}>
              <span {...bem('label')}>Mikrohus som helårsbolig</span>
            </Link>
            <Link to="/" {...bem('item')}>
              <span {...bem('label')}>Erklæring om ansvarsrett</span>
            </Link>
            <Link to="/" {...bem('item')}>
              <span {...bem('label')}>Hvor stort kan du bygge?</span>
            </Link>
            <Link to="/" {...bem('item', 'new')}>
              <Icon name="Plus" />
              <span {...bem('label')}>Ny veiviser</span>
            </Link>
          </nav>

          <button type="button" aria-label="Lukk meny" {...bem('backdrop')} onClick={closeMenu} />
        </>
      )}
    </Transition>
  )
}
