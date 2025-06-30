import { OAuthProvider, onAuthStateChanged, signInWithPopup, User } from 'firebase/auth'
import { createContext, useContext, useEffect, useState } from 'react'
import { ConfigContext } from './ConfigProvider'
import { getFirebaseApp } from '@/services/firebase'

export const FirebaseContext = createContext<ReturnType<typeof getFirebaseApp>>(null as any)
export const AuthContext = createContext<{
  loading: boolean
  user: User | null
  loginWithOidc: (() => Promise<void>) | null
}>({
  loading: true,
  user: null,
  loginWithOidc: null,
})

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const { auth, oidc } = useContext(FirebaseContext) || {}
  const [user, setUser] = useState<User | null>(null)

  function handleAuthStateChanged(user: User | null) {
    // set the user in the context
    setUser(user)

    // if we're currently in a loading state, set it to false
    loading && setLoading(false)
  }

  async function loginWithOidc() {
    if (!oidc?.provider) {
      console.warn('OIDC provider is not configured')
      return
    }

    try {
      const result = await signInWithPopup(auth, oidc.provider)
      const credential = OAuthProvider.credentialFromResult(result)
      const accessToken = credential?.accessToken
      const idToken = credential?.idToken

      console.log('OIDC login successful:', { accessToken, idToken })
    } catch (error) {
      console.error('OIDC login failed:', error)
      throw error
    }
  }

  useEffect(() => {
    onAuthStateChanged(auth, handleAuthStateChanged)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, loginWithOidc }}>{children}</AuthContext.Provider>
  )
}

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const config = useContext(ConfigContext)

  if (!config) {
    return null
  }

  const firebase = getFirebaseApp(config)

  return (
    <FirebaseContext.Provider value={firebase}>
      <AuthProvider>{children}</AuthProvider>
    </FirebaseContext.Provider>
  )
}
