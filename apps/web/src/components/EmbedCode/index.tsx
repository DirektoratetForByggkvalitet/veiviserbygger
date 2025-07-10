import { MouseEventHandler, useRef, useState } from 'react'

import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import Message from '../Message'
const bem = BEMHelper(styles)

type Props = {
  label: string
  header?: boolean
  value: string
  placeholder?: string
  id?: string
  name?: string
}

export default function TextArea({ label, header, value, ...props }: Props) {
  const [result, setResult] = useState<{ error?: true; message: string }>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const handleClick: MouseEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault()

    if (textareaRef.current) {
      textareaRef.current.focus()

      navigator.clipboard
        .writeText(textareaRef.current.value)
        .then(() => {
          setResult({ message: 'Koden ble kopiert til utklippstavlen.' })
        })
        .catch(() => {
          setResult({
            error: true,
            message:
              'Klarte ikke å kopiere koden til utklippstavlen. Merk teksten og kopier den manuelt.',
          })
        })
    }
  }

  return (
    <div {...bem('wrapper')}>
      <label
        {...bem('', {
          header,
        })}
        onClick={handleClick}
      >
        <span {...bem('label')}>{label}</span>

        <textarea {...props} {...bem('input')} ref={textareaRef} readOnly>
          {value}
        </textarea>
      </label>

      {result ? (
        <Message title={result.message} subtle={!result.error} {...bem('message')} />
      ) : null}
    </div>
  )
}
