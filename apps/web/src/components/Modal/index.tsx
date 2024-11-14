import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import Icon from '@/components/Icon'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
const bem = BEMHelper(styles)

const CLOSE_TEXT = 'Lukk'
const KEY_ESC = 27
const ANIMATION_DURATION = 800

interface Props {
  children: React.ReactNode
  title: string
  expanded: boolean
  onClose: () => void
  preventClickOutside?: boolean
}

export default function Modal({ children, title, expanded, onClose, preventClickOutside }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const contentRef = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [animateOut, setAnimateOut] = useState(false)

  useEffect(() => {
    if (show && contentRef.current) {
      contentRef.current.focus({ preventScroll: true })
    }
  }, [show])

  useEffect(() => {
    if (expanded !== show) {
      setShow(expanded)

      if (expanded) {
        setAnimateIn(true)
        document.body.classList.add('block-scrolling')

        timer.current = setTimeout(() => {
          setAnimateIn(false)
        }, ANIMATION_DURATION)
      }

      if (!expanded) {
        setAnimateOut(true)
      }
    }
  }, [expanded])

  useEffect(() => {
    if (animateOut) {
      clearTimeout(timer.current)

      timer.current = setTimeout(() => {
        if (animateOut) {
          setAnimateOut(false)
          document.body.classList.remove('block-scrolling')
        }
      }, ANIMATION_DURATION)
    }

    return () => {
      clearTimeout(timer.current)
      document.body.classList.remove('block-scrolling')
    }
  }, [animateOut])

  const handleKeyDown = ({ keyCode }: { keyCode: number }) => {
    if (keyCode === KEY_ESC) {
      onClose()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleBackdropClick = () => {
    if (preventClickOutside) {
      contentRef.current?.focus()
    } else {
      onClose()
    }
  }

  if (show || animateOut) {
    return createPortal(
      <aside
        {...bem('', {
          exiting: animateOut,
          entering: animateIn && show && !animateOut,
        })}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          {...bem('hidden-close')}
          aria-label={CLOSE_TEXT}
          onFocus={handleBackdropClick}
        />

        <div {...bem('wrapper')} ref={contentRef} tabIndex={0}>
          <div {...bem('box')}>
            <header {...bem('header')}>
              <h2 {...bem('title')}>{title}</h2>
              <button type="button" {...bem('close')} onClick={onClose}>
                <Icon name="X" />
              </button>
            </header>

            <div {...bem('content')}>{children}</div>
          </div>
        </div>

        <button
          type="button"
          aria-label={CLOSE_TEXT}
          {...bem('backdrop', {
            'animate-out': animateOut,
            'prevent-close': preventClickOutside,
          })}
          onFocus={handleBackdropClick}
          onClick={handleBackdropClick}
        />
      </aside>,
      document.body,
    )
  }

  return null
}
