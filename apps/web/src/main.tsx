import './polyfills/buffer'

import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from '@/App'
import ConfigProvider from '@/context/ConfigProvider'
import FirebaseProvider from '@/context/FirebaseProvider'

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
