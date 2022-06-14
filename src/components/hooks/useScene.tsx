import {
  addSao,
  CameraState,
  clearScene,
  exportGLTF,
  setLightAngle as setSceneLightAngle,
  toggleCameraState,
  updateMeshes,
} from 'src/hair/preview-scene'
import { createMaps } from 'src/hair/render-texture'
import { generateHair } from 'src/hair/hair-meshes'
import { useReducer, createContext, useContext, useEffect } from 'react'
import { SEED } from 'src/lib/random'

interface IState {
  lightAngle: number
  cameraState: CameraState
  seed: string
}

type IAction =
  | { type: 'setCameraState'; payload: CameraState }
  | { type: 'setLightAngle'; payload: number }
  | { type: 'setSeed'; payload: string }

interface IContext extends IState {
  changeSeed: (s: string) => void
  toggleCameraState: (s: CameraState) => void
  exportGLTF: () => Promise<void>
  generateHair: () => Promise<void>
  setLightAnlge: (v: number) => void
  exportTextures: () => Promise<void>
}

interface IStoreProviderProps {
  children: JSX.Element
}

type TReducer = React.Reducer<IState, IAction>

const initialState: IState = {
  cameraState: 'persp',
  lightAngle: 90,
  seed: SEED,
}

const reducer: TReducer = (state, action) => {
  switch (action.type) {
    case 'setCameraState':
      return { ...state, cameraState: action.payload }
    case 'setLightAngle':
      return { ...state, lightAngle: action.payload }
    case 'setSeed':
      return { ...state, seed: action.payload }
  }

  return state
}

const StoreContext = createContext<IContext | null>(null)

export const useScene = () => {
  const contextValue = useContext<IContext | null>(StoreContext)
  if (contextValue === null) {
    throw Error('Context has not been Provided!')
  }
  return contextValue
}

export const StoreProvider: React.FC<IStoreProviderProps> = ({ children }) => {
  const [{ lightAngle, cameraState, seed }, dispatch] = useReducer<TReducer>(
    reducer,
    initialState
  )

  const context: IContext = {
    cameraState,
    lightAngle,
    seed,

    toggleCameraState: (val: CameraState) => {
      dispatch({ type: 'setCameraState', payload: val })
      toggleCameraState(val)
    },

    setLightAnlge: (val) => {
      setSceneLightAngle(val)
      dispatch({ type: 'setLightAngle', payload: val })
    },

    changeSeed: (val) => {
      dispatch({ type: 'setSeed', payload: val })
    },

    exportGLTF: async () => {
      await exportGLTF()
    },

    generateHair: async () => {
      clearScene()
      await generateHair(seed)
      updateMeshes()
    },

    exportTextures: async () => {
      await createMaps()
    },
  }

  useEffect(() => {
    context.setLightAnlge(initialState.lightAngle)
    context.toggleCameraState(initialState.cameraState)
    context.changeSeed(initialState.seed)
  }, [])

  return (
    <StoreContext.Provider value={context}>{children}</StoreContext.Provider>
  )
}
