import { exportGLTF, toggleCameraState, updateMeshes } from 'src/hair/scene'
import {
  createScene,
  renderTexture,
  updateMeshes as updateMeshesTexture,
} from 'src/hair/render-texture'
import { generateHair } from 'src/hair/hair-meshes'

export const useScene = () => {
  return {
    toggleCameraState: toggleCameraState,

    exportGLTF: async () => {
      await exportGLTF()
    },

    generateHair: async () => {
      await generateHair()
      updateMeshes()
    },

    exportTexture: async () => {
      createScene()
      updateMeshesTexture()
      renderTexture()
    },
  }
}
