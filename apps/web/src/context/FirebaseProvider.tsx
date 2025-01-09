import { onAuthStateChanged, User } from 'firebase/auth'
import { createContext, useContext, useEffect, useState } from 'react'
import { ConfigContext } from './ConfigProvider'
import { getFirebaseApp } from '@/services/firebase'

export const FirebaseContext = createContext<ReturnType<typeof getFirebaseApp>>(null as any)
export const AuthContext = createContext<{ loading: boolean; user: User | null }>({
  loading: true,
  user: null,
})

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const { auth } = useContext(FirebaseContext) || {}
  const [user, setUser] = useState<User | null>(null)

  function handleAuthStateChanged(user: User | null) {
    // set the user in the context
    setUser(user)

    // if we're currently in a loading state, set it to false
    loading && setLoading(false)
  }

  useEffect(() => {
    onAuthStateChanged(auth, handleAuthStateChanged)
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
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
