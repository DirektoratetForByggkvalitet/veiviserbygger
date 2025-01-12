import { useAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import useAuth from '@/hooks/auth'
import menuState from '@/store/menu'

import Icon from '@/components/Icon'
import Transition from '@/components/Transition'
import User from '@/components/User'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import useWizards from '@/hooks/useWizards'
import NewWizard from '../NewWizard'
const bem = BEMHelper(styles)

interface Props {
  openWizardId?: string
}
export default function Menu({ openWizardId }: Props) {
  const { logout, user } = useAuth()
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
              <section {...bem('section')}>
                <h2 {...bem('section-title')}>Veivisere</h2>
                <ul {...bem('menu-items')}>
                  {wizards?.map((wizard) => (
                    <li key={wizard.id}>
                      <Link
                        to={`/wizard/${wizard.id}${wizard.data.publishedVersion ? `/${wizard.data.publishedVersion}` : ''}`}
                        {...bem('item', { open: openWizardId === wizard.id })}
                        onClick={closeMenu}
                      >
                        <span {...bem('label')}>{wizard.data.title}</span>
                        {!wizard.data.publishedVersion ? (
                          <span {...bem('tag')}>Utkast</span>
                        ) : (
                          <span {...bem('tag', 'public')}>Publisert</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
                <button {...bem('item', 'new')} onClick={toggleModal(true)}>
                  <Icon name="Plus" />
                  <span {...bem('label')}>Ny veiviser</span>
                </button>
              </section>
              <section {...bem('section', 'bottom')}>
                <h2 {...bem('section-title')}>Innlogget</h2>

                <User
                  name={user?.displayName || user?.email}
                  options={[{ value: '', label: 'Logg ut', onClick: logout }]}
                />
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
