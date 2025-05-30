import { Navigate, Route, Routes } from 'react-router-dom'

import Login from '@/pages/Login'
import Overview from '@/pages/Overview'
import Wizard from '@/pages/Wizard'
import Preview from '@/pages/Preview'

import useAuth from '@/hooks/auth'
import Loader from './components/Loader'
import { EditableContext } from './context/EditableContext'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loader />
  }

  return (
    <EditableContext.Provider value={true}>
      <Routes>
        {!user ? (
          <>
            <Route path="/" element={<Login />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Overview />} />
            <Route path="/wizard/:wizardId?/:versionId?" Component={Wizard} />
            <Route path="/wizard/:wizardId/:versionId/preview" Component={Preview} />
          </>
        )}
      </Routes>
    </EditableContext.Provider>
  )
}
