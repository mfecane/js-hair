import React, { useState } from 'react'

import Renderer from './renderer'

import './app.scss'
import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
} from '@mui/material'

import LoadingButton from '@mui/lab/LoadingButton'

import {
  CameraState,
  exportObj,
  generateHair,
  toggleCameraState,
} from 'src/renderer'

const App: React.FC = () => {
  const [cameraState, setCameraState] = useState('ortho')
  const [loading, setLoading] = useState(false)
  const [loading2, setLoading2] = useState(false)

  const handleChangeCamera = (e: SyntheticBaseEvent) => {
    const value = e.target.value as CameraState
    toggleCameraState(value)
    setCameraState(value)
  }

  const handleExport = () => {
    setLoading(true)
    exportObj().then(() => {
      setLoading(false)
    })
  }

  const handleGenerate = () => {
    setLoading2(true)
    generateHair().then(() => {
      setLoading2(false)
    })
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
                value="ortho"
                control={<Radio />}
                label="Orthographic"
              />
              <FormControlLabel
                value="persp"
                control={<Radio />}
                label="Perspective"
              />
            </RadioGroup>
          </FormControl>
          <FormControl>
            <LoadingButton
              loading={loading2}
              variant="contained"
              onClick={handleGenerate}
            >
              Generate
            </LoadingButton>
          </FormControl>
          <FormControl>
            <LoadingButton
              loading={loading}
              variant="outlined"
              onClick={handleExport}
            >
              Export OBJ
            </LoadingButton>
          </FormControl>
        </Stack>
      </div>
    </div>
  )
}

export default App
