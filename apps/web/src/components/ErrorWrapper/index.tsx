import useErrors from '@/hooks/errors'
import { ReactNode } from 'react'
import BEMHelper from '@/lib/bem'
import styles from './Styles.module.scss'
import Icon from '../Icon'

const bem = BEMHelper(styles)

type Props = {
  children: ReactNode
  slice?: string[]
  /**
   * Additional error messages to show alongside any errors from the validation
   * context, e.g. for validation that is local to a component and not part of
   * the schema-driven validation.
   */
  messages?: string[]
}

export default function ErrorWrapper({ children, slice = [], messages = [] }: Props) {
  const { getErrors } = useErrors()
  const errors = [...messages.map((message) => ({ message })), ...getErrors(slice)]

  const hasErrors = errors.length > 0

  return (
    <div {...bem('', { 'has-errors': hasErrors })}>
      {hasErrors ? (
        <div {...bem('errors')}>
          <Icon name="Info" {...bem('icon')} />

          <ul {...bem('list')}>
            {errors.map((error, index) => (
              <li key={index} {...bem('error')}>
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div {...bem('wrapped', { 'has-errors': hasErrors })}>{children}</div>
    </div>
  )
}
