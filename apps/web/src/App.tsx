import { Route, Routes } from 'react-router-dom'

import Login from '@/pages/Login'
import Overview from '@/pages/Overview'

import Page from '@/components/Page'

import useAuth from '@/hooks/auth'

export default function App() {
  const { user } = useAuth()

  return (
    <Page>
      <Routes>
        {!user ? <Route path="/" element={<Login />} /> : <Route path="/" element={<Overview />} />}
      </Routes>
    </Page>
  )
}
