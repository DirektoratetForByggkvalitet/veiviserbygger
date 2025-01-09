import { useAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import useAuth from '@/hooks/auth'
import menuState from '@/store/menu'

import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Transition from '@/components/Transition'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import useWizards from '@/hooks/useWizards'
import NewWizard from '../NewWizard'
const bem = BEMHelper(styles)

export default function Menu() {
  const { logout } = useAuth()
  const [modal, setModal] = useState(false)
  const [open, setOpen] = useAtom(menuState)
  const { wizards } = useWizards(open)

  const menuRef = useRef<HTMLDivElement>(null)

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
        {...bem('', '', open ? 'overlay' : undefined)}
        enter={300}
        exit={300}
      >
        {open && (
          <>
            <nav {...bem('content')} ref={menuRef} tabIndex={0}>
              {wizards?.map((wizard) => (
                <Link
                  key={wizard.id}
                  to={`/wizard/${wizard.id}${wizard.data.publishedVersion ? `/${wizard.data.publishedVersion}` : ''}`}
                  {...bem('item')}
                >
                  <span {...bem('label')}>
                    {wizard.data.title}
                    {!wizard.data.publishedVersion ? ' (ikke publisert)' : ''}
                  </span>
                </Link>
              ))}

              <button {...bem('item', 'new')} onClick={toggleModal(true)}>
                <Icon name="Plus" />
                <span {...bem('label')}>Ny veiviser</span>
              </button>

              <Button onClick={logout}>Logg inn i ut</Button>
            </nav>

            <button type="button" aria-label="Lukk meny" {...bem('backdrop')} onClick={closeMenu} />
          </>
        )}
      </Transition>

      <NewWizard open={modal} toggleModal={toggleModal} />
    </>
  )
}
