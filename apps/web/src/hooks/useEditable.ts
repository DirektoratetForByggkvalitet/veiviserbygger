import { EditableContext } from '@/context/EditableContext'
import { useContext } from 'react'

export const useEditable = () => {
  return useContext(EditableContext)
}
