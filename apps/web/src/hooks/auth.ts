import { AuthContext, FirebaseContext } from '@/context/FirebaseProvider'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { useCallback, useContext } from 'react'

export default function useAuth() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { auth } = useContext(FirebaseContext)!
  const user = useContext(AuthContext)

  const signUp = useCallback(
    (email: string, password: string) => {
      if (user) {
        return
      }

      return createUserWithEmailAndPassword(auth, email, password)
    },
    [auth, user],
  )

  const login = useCallback(
    (type: 'email', credentials?: { email: string; password: string }) => {
      if (user) {
        return
      }

      if (type === 'email' && credentials) {
        return signInWithEmailAndPassword(auth, credentials.email, credentials.password)
      }

      console.log(`Unsupported login type: ${type}`)
    },
    [auth, user],
  )

  const logout = useCallback(() => {
    if (!user) {
      return
    }

    return signOut(auth)
  }, [auth, user])

  return { user, login, signUp, logout }
}
