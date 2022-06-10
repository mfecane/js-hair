import React, { useState } from 'react'

import Renderer from './renderer'

import './app.scss'
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
} from '@mui/material'

import LoadingButton from '@mui/lab/LoadingButton'
import { useScene } from 'src/components/hooks/useScene'
import WaitButton from './wait-button'
import { CameraState } from 'src/hair/scene'

const App: React.FC = () => {
  const [cameraState, setCameraState] = useState('persp')

  const { exportGLTF, generateHair, exportTexture, toggleCameraState } =
    useScene()

  const handleChangeCamera = (e: SyntheticBaseEvent) => {
    const value = e.target.value as CameraState
    toggleCameraState(value)
    setCameraState(value)
  }

  return (
    <div className="app-container">
      <Renderer />
      <div className="app-container__right">
        <Stack spacing={2} sx={{ mt: 4, mr: 4, ml: 4, mb: 4 }}>
          <FormControl>
            <FormLabel id="demo-radio-buttons-group-label">Camera</FormLabel>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              value={cameraState}
              name="radio-buttons-group"
              onChange={handleChangeCamera}
            >
              <FormControlLabel
                value="persp"
                control={<Radio />}
                label="Perspective"
              />
              <FormControlLabel
                value="ortho"
                control={<Radio />}
                label="Orthographic"
              />
            </RadioGroup>
          </FormControl>
          <FormControl>
            <WaitButton variant="contained" callback={generateHair}>
              Generate
            </WaitButton>
          </FormControl>
          <FormControl>
            <WaitButton callback={exportGLTF}>Export GLTF</WaitButton>
          </FormControl>
          <FormControl>
            <WaitButton callback={exportTexture}>Export Texture</WaitButton>
          </FormControl>
        </Stack>
      </div>
    </div>
  )
}

export default App
