import {
  addSao,
  CameraState,
  exportGLTF,
  setLightAngle as setSceneLightAngle,
  toggleCameraState,
  updateMeshes,
} from 'src/hair/preview-scene'
import {
  createScene,
  renderAoTexture,
  renderTexture,
} from 'src/hair/render-texture'
import { generateHair } from 'src/hair/hair-meshes'
import { useReducer, createContext, useContext, useEffect } from 'react'

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
  generateHair: (s: string) => Promise<void>
  exportTexture: () => Promise<void>
  exportAo: () => Promise<void>
  addSao: () => void
  setLightAnlge: (v: number) => void
}

interface IStoreProviderProps {
  children: JSX.Element
}

type TReducer = React.Reducer<IState, IAction>

const initialState: IState = {
  cameraState: 'persp',
  lightAngle: 90,
  seed: 'ssibal',
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
      await generateHair(seed)
      updateMeshes()
    },

    exportTexture: async () => {
      // createScene()
      // updateMeshesTexture()
      // renderTexture()
    },

    exportAo: async () => {
      createScene()
      await renderAoTexture()
    },

    addSao: addSao,
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
