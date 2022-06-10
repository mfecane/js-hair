import * as THREE from 'three'
import { saveAs } from 'file-saver'
import { getGroups } from './hair-meshes'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'

let scene: THREE.Scene
let group: THREE.Group
let width: number = 4096
let height: number = 4096
let orthoCamera: THREE.OrthographicCamera
let renderer: THREE.WebGLRenderer
let composer: EffectComposer
let renderPass
let saoPass

export const createScene = () => {
  scene = new THREE.Scene()
  group = new THREE.Group()
  scene.add(group)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(1.0, 1.0, 1.0)
  scene.add(directionalLight)

  // TODO ::: make occlution by casting light from different directions
  orthoCamera = new THREE.OrthographicCamera(0, 1, 1, 0, -0.1, 0.1)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)

  renderer.setPixelRatio(window.devicePixelRatio)
}

export const renderTexture = () => {
  const bufferTexture = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.NearestFilter,
  })

  renderer.setRenderTarget(bufferTexture)
  composer = new EffectComposer(renderer, bufferTexture)
  composer.setSize(width, height)
  renderPass = new RenderPass(scene, orthoCamera)
  saoPass = new SAOPass(scene, orthoCamera, false, true)
  composer.addPass(saoPass)
  composer.render()
  // const rendercomposer.writeBuffer()

  let texture = bufferTexture.texture

  // var gl = renderer.getContext()
  var pixels = new Uint8Array(4 * width * height)

  composer.renderer.readRenderTargetPixels(
    bufferTexture,
    0,
    0,
    width,
    height,
    pixels
  )
  // gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  var imageData = new ImageData(new Uint8ClampedArray(pixels), width, height)

  var canvas = document.createElement('canvas')
  var ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to retrieve canvas context')
  }
  canvas.width = imageData.width
  canvas.height = imageData.height
  ctx.putImageData(imageData, 0, 0)

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve) // implied image/png format
  }).then((blob) => {
    if (blob) {
      saveAs(blob, 'texture.png')
    }
  })
}

export function updateMeshes() {
  const groups = getGroups()
  groups.forEach((g) => {
    group.add(g)
  })
}
