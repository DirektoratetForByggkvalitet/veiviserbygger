import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ConfigProvider from './components/ConfigProvider'
import FirebaseProvider from './components/FirebaseProvider'
import './styles/styles.scss'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider>
      <FirebaseProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </FirebaseProvider>
    </ConfigProvider>
  </React.StrictMode>,
)
