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
}

type IAction =
  | { type: 'setCameraState'; payload: CameraState }
  | { type: 'setLightAngle'; payload: number }

interface IContext extends IState {
  toggleCameraState: (s: CameraState) => void
  exportGLTF: () => Promise<void>
  generateHair: () => Promise<void>
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
}

const reducer: TReducer = (state, action) => {
  switch (action.type) {
    case 'setCameraState':
      return { ...state, cameraState: action.payload }
    case 'setLightAngle':
      return { ...state, lightAngle: action.payload }
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
  const [{ lightAngle, cameraState }, dispatch] = useReducer<TReducer>(
    reducer,
    initialState
  )

  const context: IContext = {
    cameraState,
    lightAngle,

    toggleCameraState: (val: CameraState) => {
      dispatch({ type: 'setCameraState', payload: val })
      toggleCameraState(val)
    },

    setLightAnlge: (val) => {
      setSceneLightAngle(val)
      dispatch({ type: 'setLightAngle', payload: val })
    },

    exportGLTF: async () => {
      await exportGLTF()
    },

    generateHair: async () => {
      await generateHair()
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
  }, [])

  return (
    <StoreContext.Provider value={context}>{children}</StoreContext.Provider>
  )
}
