import { Renderer } from 'src/instanced/Renderer'
import { ThreeLightsLightScheme } from './ThreeLightLightSceme'
import * as THREE from 'three'
import { FiberSurfaceFactory } from './FiberSurfaceFactory'

let renderer: Renderer

export const exec = () => {
  const div = document.createElement('div')
  div.style.width = window.innerWidth + 'px'
  div.style.height = window.innerHeight + 'px'
  document.body.appendChild(div)

  renderer = new Renderer(div)
  new ThreeLightsLightScheme(renderer)
  createObjects()

  const ah = new THREE.AxesHelper()
  renderer.scene.add(ah)

  renderer.animate()
}

function createObjects(): void {
  const carpetFactory = new FiberSurfaceFactory({
    surfaceColorMap: './texture_light.png',
  })
  renderer.scene.add(carpetFactory.mesh!)
}
