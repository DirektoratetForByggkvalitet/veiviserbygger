import { useAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import useAuth from '@/hooks/auth'
import menuState from '@/store/menu'

import Button from '@/components/Button'
import Editor from '@/components/Editor'
import Form from '@/components/Form'
import Icon from '@/components/Icon'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import Transition from '@/components/Transition'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

export default function Menu() {
  const { logout } = useAuth()
  const [modal, setModal] = useState(false)

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

      <Modal title="Ny veiviser" expanded={modal} onClose={toggleModal(false)} preventClickOutside>
        <Form>
          <Input
            label="Tittel"
            value=""
            onChange={() => {
              console.log('Hej')
            }}
          />
          <Editor label="Innhold" />
        </Form>
      </Modal>
    </>
  )
}
