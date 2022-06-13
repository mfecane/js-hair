import React from 'react'
import Renderer from './renderer'
import Controls from 'src/components/controls'

import 'src/components/app.scss'
import { StoreProvider } from 'src/components/hooks/useScene'

const App: React.FC = () => {
  return (
    <StoreProvider>
      <div className="app-container">
        <Renderer />
        <Controls />
      </div>
    </StoreProvider>
  )
}

export default App
