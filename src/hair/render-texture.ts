import * as THREE from 'three'
import { saveAs } from 'file-saver'
import { applyMaterials } from './hair-meshes'
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
  directionalLight.castShadow = true
  scene.add(directionalLight)

  // TODO ::: make occlution by casting light from different directions
  orthoCamera = new THREE.OrthographicCamera(0, 1, 1, 0, -0.1, 0.1)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)

  renderer.setPixelRatio(window.devicePixelRatio)
}

export const renderTexture = () => {
  return renderTexturePlain()
}

export const renderTexturePlain = () => {
  renderer.render(scene, orthoCamera)

  const gl = renderer.getContext()
  var pixels = new Uint8Array(4 * width * height)
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
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
    scene.clear()
  })
}

export const renderTextureComp = () => {
  const bufferTexture = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.NearestFilter,
  })

  // renderer.setRenderTarget(bufferTexture)
  composer = new EffectComposer(renderer, bufferTexture)
  composer.setSize(width, height)
  renderPass = new RenderPass(scene, orthoCamera)
  composer.addPass(renderPass)
  // saoPass = new SAOPass(scene, orthoCamera, false, true)
  // composer.addPass(saoPass)
  composer.render()

  // composer.writeBuffer.texture

  const scene2 = new THREE.Scene()
  const geometry = new THREE.PlaneGeometry(1, 1)
  const material = new THREE.MeshBasicMaterial({
    color: 0x666666,
    side: THREE.DoubleSide,
    map: bufferTexture.texture,
    // map: composer.writeBuffer.texture,
  })
  const plane = new THREE.Mesh(geometry, material)
  plane.name = 'Plane'
  plane.position.set(0.5, 0.5, 0.0)
  scene2.add(plane)

  const renderer2 = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  const camera2 = new THREE.OrthographicCamera(0, 1, 1, 0, -0.1, 0.1)
  renderer2.setPixelRatio(window.devicePixelRatio)
  renderer2.setSize(width, height)
  renderer2.render(scene2, camera2)

  // const rendercomposer.writeBuffer()

  // let texture = bufferTexture.texture
  // debugger

  var gl = renderer2.getContext()
  // var gl = composer.renderer.getContext()
  var pixels = new Uint8Array(4 * width * height)

  // composer.renderer.readRenderTargetPixels(
  //   bufferTexture,
  //   0,
  //   0,
  //   width,
  //   height,
  //   pixels
  // )
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
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
  const materials = new Array(5).map(() => {
    const mat = new THREE.MeshBasicMaterial()
    return mat
  })
  const groups = applyMaterials(materials)
  groups.forEach((g) => {
    group.add(g)
  })
}
