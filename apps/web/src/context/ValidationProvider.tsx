import { validate } from '@/services/firebase/utils/validator'
import { DocumentReference } from 'firebase/firestore'
import { useAtom } from 'jotai'
import validateStore from '@/store/validate'
import { createContext, ReactNode, useContext } from 'react'

type Props = {
  children: ReactNode

  /**
   * Validation result to provide. If not provided, the context will use the parent ValidationProvider's value.
   */
  value?: ReturnType<typeof validate>

  /**
   * Slice of the document and path to provide errors for. For nested navigation contexts this is useful to lift
   * the keep the validation context clean while at the same time providing consumers (hooks) with the correct
   * subset of errors.
   */
  slice?: {
    doc?: DocumentReference
    path?: string[]
  }
}

export const ValidationContext = createContext<{
  result: ReturnType<typeof validate> | null
  slice?: {
    doc?: DocumentReference
    path?: string[]
  }
}>({ result: null })

export default function ValidationProvider({ children, value, slice }: Props) {
  const parentValidation = useContext(ValidationContext)
  const [validationActive] = useAtom(validateStore)

  if (!value && !parentValidation?.result) {
    throw new Error(
      'ValidationProvider must be provided with a value or be nested inside another ValidationProvider',
    )
  }

  if (value && parentValidation?.result) {
    console.warn(
      'You are nesting ValidationProviders with values. This is not recommended and may lead to unexpected behavior since different sub-trees of the rendering will react to different sets of errors.',
      value,
      parentValidation,
    )
  }

  if (!validationActive) {
    return (
      <ValidationContext.Provider value={{ result: [] }}>{children}</ValidationContext.Provider>
    )
  }

  return (
    <ValidationContext.Provider value={{ result: value || parentValidation.result, slice }}>
      {children}
    </ValidationContext.Provider>
  )
}
