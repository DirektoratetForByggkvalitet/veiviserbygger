import { Navigate, Route, Routes } from 'react-router-dom'

import Login from '@/pages/Login'
import Overview from '@/pages/Overview'

import useAuth from '@/hooks/auth'
import Loader from './components/Loader'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loader />
  }

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Overview />} />
          <Route path="/wizard/:wizardId?/:versionId?" Component={Overview} />
        </>
      )}
    </Routes>
  )
}
