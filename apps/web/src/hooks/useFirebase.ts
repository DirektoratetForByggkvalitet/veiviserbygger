import { FirebaseContext } from '@/context/FirebaseProvider'
import { useContext } from 'react'

export default function useFirebase() {
  return useContext(FirebaseContext)
}
