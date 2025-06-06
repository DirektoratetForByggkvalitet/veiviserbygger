import Icon from '@/components/Icon'
import { useEditable } from '@/hooks/useEditable'
import menuState from '@/store/menu'
import { useAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import Transition from '@/components/Transition'
import WizardList from '@/components/WizardList'

import useWizards from '@/hooks/useWizards'
import BEMHelper from '@/lib/bem'
import Button from '../Button'
import NewWizard from '../NewWizard'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

export default function Menu() {
  const [modal, setModal] = useState(false)
  const [open, setOpen] = useAtom(menuState)
  const { wizards } = useWizards(open)
  const menuRef = useRef<HTMLDivElement>(null)
  const isEditable = useEditable()

  const closeMenu = () => {
    setOpen(false)
  }

  useEffect(() => {
    if (open && menuRef.current) {
      menuRef.current.focus()
    }
  }, [open])

  const toggleModal = (value: boolean) => () => {
    setModal(value)
    closeMenu()
  }

  return (
    <>
      <Transition
        updateKey={open.toString()}
        {...bem('', { 'header-message-visible': !isEditable }, open ? 'overlay' : undefined)}
        enter={300}
        exit={300}
      >
        {open && (
          <>
            <nav {...bem('content')} ref={menuRef} tabIndex={0}>
              <Link to="/" {...bem('link')} onClick={closeMenu}>
                <span {...bem('label')}>Oversikt</span>
                <Icon name="LayoutGrid" />
              </Link>

              <section {...bem('section')}>
                <header {...bem('section-header')}>
                  <h2 {...bem('section-title')}>Veivisere</h2>
                  <Button
                    onClick={toggleModal(true)}
                    iconOnly
                    size="small"
                    icon="Plus"
                    aria-label="Ny veiviser"
                  />
                </header>
                <WizardList wizards={wizards} onLinkClick={closeMenu} compact />
              </section>
            </nav>

            <button type="button" aria-label="Lukk meny" {...bem('backdrop')} onClick={closeMenu} />
          </>
        )}
      </Transition>

      <NewWizard open={modal} toggleModal={toggleModal} />
    </>
  )
}
