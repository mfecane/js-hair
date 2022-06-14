import React, { SyntheticEvent } from 'react'

import './app.scss'
import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { useScene } from 'src/components/hooks/useScene'
import WaitButton from './wait-button'
import { CameraState } from 'src/hair/preview-scene'

const Controls: React.FC = () => {
  const {
    cameraState,
    lightAngle,
    seed,
    exportGLTF,
    generateHair,
    exportTextures,
    toggleCameraState,
    setLightAnlge,
    changeSeed,
  } = useScene()

  const handleChangeCamera = (e: Event) => {
    const value = e.target.value as CameraState
    toggleCameraState(value)
  }

  const handleAngleChange = (
    e: Event,
    value: number | number[],
    activeThumb: number
  ) => {
    setLightAnlge(value as number)
  }

  const handleChangeSeed = (e: Event) => {
    const value = e.target.value as string
    changeSeed(value)
  }

  return (
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
          <TextField
            id="seed"
            label="Seed"
            variant="outlined"
            value={seed}
            onChange={handleChangeSeed}
          />
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
          <WaitButton callback={exportTextures}>Export textures</WaitButton>
        </FormControl>
        <FormControl>
          <Typography>Light position</Typography>
          <Slider
            defaultValue={70}
            value={lightAngle}
            onChange={handleAngleChange}
            valueLabelDisplay="auto"
            min={30}
            max={150}
          />
        </FormControl>
      </Stack>
    </div>
  )
}

export default Controls
