import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { ConfigContext } from './ConfigProvider'
import { getFirebaseApp } from '@/services/firebase'

export const FirebaseContext = createContext<ReturnType<typeof getFirebaseApp>>(undefined)
export const AuthContext = createContext<User | null>(null)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { auth } = useContext(FirebaseContext)!
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    onAuthStateChanged(auth, setUser)
  }, [])

  return (
    <AuthContext.Provider value={user}>
      {children}
    </AuthContext.Provider>
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
      <AuthProvider>
        {children}
      </AuthProvider>
    </FirebaseContext.Provider>
  )
}
