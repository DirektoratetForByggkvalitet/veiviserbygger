import { AuthContext, FirebaseContext } from '@/context/FirebaseProvider'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { useCallback, useContext } from 'react'

export default function useAuth() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const firebaseContext = useContext(FirebaseContext)
  const authContext = useContext(AuthContext)
  const auth = firebaseContext?.auth ?? null
  const oidc = firebaseContext?.oidc ?? null
  const user = authContext?.user ?? null
  const loading = authContext?.loading ?? false

  const signUp = useCallback(
    (email: string, password: string) => {
      if (!auth || user) {
        return
      }

      return createUserWithEmailAndPassword(auth, email, password)
    },
    [auth, user],
  )

  const login = useCallback(
    (type: 'email', credentials?: { email: string; password: string }) => {
      if (!auth || user) return

      if (type === 'email' && credentials) {
        return signInWithEmailAndPassword(auth, credentials.email, credentials.password)
      }

      console.log(`Unsupported login type: ${type}`)
      return Promise.reject(new Error('Unsupported login type'))
    },
    [auth, user],
  )
  const logout = useCallback(() => {
    if (!auth || !user) return

    return signOut(auth)
  }, [auth, user])

  return {
    user,
    oidc: authContext.loginWithOidc
      ? {
          name: oidc?.name || 'OIDC',
          login: authContext.loginWithOidc,
        }
      : null,
    login,
    signUp,
    logout,
    loading,
  }
}
