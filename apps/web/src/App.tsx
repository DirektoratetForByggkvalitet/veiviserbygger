import { Navigate, Route, Routes } from 'react-router-dom'

import Login from '@/pages/Login'
import Overview from '@/pages/Overview'

import Page from '@/components/Page'

import useAuth from '@/hooks/auth'
import Loader from './components/Loader'

export default function App() {
  const { user, loading } = useAuth()

  console.log(user)

  if (loading) {
    return <Loader />
  }

  return (
    <Page>
      <Routes>
        {!user ? <>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </> :
          <>
            {/* <Route path="/" element={<Overview />} /> */}
            <Route path="/:wizardId?/:version?" element={<Overview />} />
          </>}
      </Routes>
    </Page>
  )
}
