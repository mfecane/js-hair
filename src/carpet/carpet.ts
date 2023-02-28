import * as THREE from 'three'
import { CurvesGenerator } from './CurvesGenerator'
import { ExtrudedMeshGenerator, HairCurve } from './ExtrudedMeshGenerator'
import { Renderer } from './Renderer'
import { ThreeLightsLightScheme } from './ThreeLightLightSceme'

let renderer: Renderer

export const showCarpet = (el: HTMLElement) => {
  renderer = new Renderer(el)
  new ThreeLightsLightScheme(renderer)
  createObjects()
  const ah = new THREE.AxesHelper()
  renderer.scene.add(ah)
  renderer.animate()
}

function createObjects(): void {
  const curvesGenerator = new CurvesGenerator()
  const extrudedMeshGenerator = new ExtrudedMeshGenerator()
  const curves = curvesGenerator.crateCurves()
  curves.forEach((curve: HairCurve) => {
    const geometry = extrudedMeshGenerator.createGeo(curve)
    const material = new THREE.MeshLambertMaterial({
      color: 0xffffff,
    })
    const mesh = new THREE.Mesh(geometry, material)
    renderer.scene.add(mesh)
  })
}
