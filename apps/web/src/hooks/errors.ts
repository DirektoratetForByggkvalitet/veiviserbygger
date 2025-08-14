import { ValidationContext } from '@/context/ValidationProvider'
import { useContext } from 'react'

export default function useErrors() {
  const validation = useContext(ValidationContext)

  const errors =
    validation.result?.filter((error) => {
      if (!validation.slice) return true

      // if the error is for a different slice
      if (validation.slice.doc && error.doc.path !== validation.slice.doc.path) return false

      // if the error is for a different path
      if (
        validation.slice.path?.length &&
        error.path.slice(0, validation.slice.path.length).join('.') !==
          validation.slice.path.join('.')
      ) {
        return false
      }

      return true
    }) ?? []

  const getErrors = (...path: string[]) => {
    const requestedPath = [...(validation.slice?.path ?? []), ...path]

    return errors.filter((error) => {
      return error.path.slice(0, requestedPath.length).join('.') === requestedPath.join('.')
    })
  }

  const hasErrors = errors.length > 0

  return {
    hasErrors,
    getErrors,
    errors,
  }
}
