import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import { saveAs } from 'file-saver'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { clearGeoGroup, generateHair } from './hair-meshes'
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass'
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js'
import { createMeshes, removeMeshes } from './scene-helpers'

export type CameraState = 'persp' | 'ortho'

let element: HTMLDivElement
let scene: THREE.Scene
let group: THREE.Group
let width: number = 512
let height: number = 512
let orthoCamera: THREE.OrthographicCamera
let perspCamera: THREE.PerspectiveCamera
let controls: OrbitControls | null
let cameraState: CameraState = 'persp'
let renderer: THREE.WebGLRenderer
let composer: EffectComposer
let directionalLight: THREE.DirectionalLight

const createScene = () => {
  scene = new THREE.Scene()
  group = new THREE.Group()
  scene.add(group)
  // scene.background = new THREE.Color(0x999999)
  addPlane()

  const lightAngle = Math.PI / 2.0

  directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(Math.cos(lightAngle), 0.5, Math.sin(lightAngle))
  scene.add(directionalLight.target)
  directionalLight.target.position.set(0.5, 0.5, 0.0)
  directionalLight.castShadow = true
  directionalLight.shadow.radius = 4
  directionalLight.shadow.mapSize.width = 2048 // default
  directionalLight.shadow.mapSize.height = 2048 // default
  directionalLight.shadow.camera.near = 0.5 // default
  directionalLight.shadow.camera.far = 2 // default
  const shadowSize = 0.6
  directionalLight.shadow.camera.top = shadowSize
  directionalLight.shadow.camera.right = shadowSize
  directionalLight.shadow.camera.bottom = -shadowSize
  directionalLight.shadow.camera.left = -shadowSize
  scene.add(directionalLight)

  // const directionalLighthelper = new THREE.DirectionalLightHelper(
  //   directionalLight,
  //   5
  // )
  // scene.add(directionalLighthelper)

  // const directionalLightShadowHelper = new THREE.CameraHelper(
  //   directionalLight.shadow.camera
  // )
  // scene.add(directionalLightShadowHelper)

  const light = new THREE.AmbientLight(0xffffff, 0.2) // soft white light
  scene.add(light)

  // TODO ::: make occlution by casting light from different directions
  perspCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000)
  perspCamera.position.set(0.5, 0.5, 2)
  perspCamera.lookAt(0.5, 0.5, 0)

  orthoCamera = new THREE.OrthographicCamera(0, 1, 1, 0, -0.15, 0.15)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height)
  window.addEventListener('resize', updateSize)
}

const addPlane = () => {
  const geometry = new THREE.PlaneGeometry(1, 1)
  const material = new THREE.MeshStandardMaterial({
    color: 0x333333,
    side: THREE.DoubleSide,
  })
  const plane = new THREE.Mesh(geometry, material)
  // plane.castShadow = false
  // plane.receiveShadow = true
  plane.name = 'Plane'
  plane.position.set(0.5, 0.5, 0.0)
  scene.add(plane)
}

// TODO ::: make occlution by casting light from different directions

export const mount = (el: HTMLDivElement) => {
  element = el
  updateSize()
  element.appendChild(renderer.domElement)
}

export function exportObj() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const exporter = new OBJExporter()
      const data = exporter.parse(scene)
      var blob = new Blob([data], { type: 'text/plain' })
      saveAs(blob, 'model.obj')
      resolve(null)
    }, 100)
  })
}

export function exportGLTF() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const exporter = new GLTFExporter()
      exporter.parse(
        scene,
        (gltf) => {
          debugger
          var blob = new Blob([JSON.stringify(gltf)], { type: 'text/plain' })
          saveAs(blob, 'model.gltf')
          resolve(null)
        },
        (err) => {
          reject(err)
        },
        {}
      )
    }, 100)
  })
}

export function toggleCameraState(state: CameraState) {
  if (cameraState === state) {
    return
  }

  cameraState = state
  createComposer()

  if (cameraState === 'ortho') {
    if (controls) {
      controls.dispose()
      controls = null
    }
    return
  }

  if (!controls) {
    createOrbitControls()
  }
}

function updateSize() {
  if (!element) {
    return
  }
  perspCamera.updateProjectionMatrix()
  const rect = element.getBoundingClientRect()
  const min = Math.min(rect.width, rect.height)
  width = min
  height = min
  renderer.setSize(min, min)
  createComposer()
}

function getCamera() {
  if (cameraState === 'persp') {
    return perspCamera
  }
  return orthoCamera
}

function createComposer() {
  composer = new EffectComposer(renderer)
  composer.setSize(width, height)
  composer.addPass(new RenderPass(scene, getCamera()))

  // const pass = new SMAAPass(
  //   width * renderer.getPixelRatio(),
  //   height * renderer.getPixelRatio()
  // )
  // composer.addPass(pass)

  // const saoPass = new SAOPass(scene, orthoCamera, false, true)
  // composer.addPass(saoPass)
}

export const addSao = () => {
  // const saoPass = new SAOPass(scene, perspCamera, false, true)
  // saoPass.params.output = SAOPass.OUTPUT.Beauty
  // saoPass.params.saoBias = -1
  // saoPass.params.saoIntensity = 0.2
  // saoPass.params.saoScale = 0.95
  // saoPass.params.saoKernelRadius = 50
  // saoPass.params.saoMinResolution = 0
  // saoPass.params.saoBlurRadius = 8
  // saoPass.params.saoBlurStdDev = 4
  // saoPass.params.saoBlurDepthCutoff = 0.01
  // saoPass.params.saoBlur = true

  // composer.addPass(saoPass)

  const ssaoPass = new SSAOPass(scene, perspCamera, width, height)
  ssaoPass.kernelRadius = 16
  ssaoPass.minDistance = 0.0005
  ssaoPass.maxDistance = 0.001
  composer.addPass(ssaoPass)
}

function createOrbitControls() {
  controls = new OrbitControls(perspCamera, renderer.domElement)
  controls.minDistance = 0.2
  controls.maxDistance = 5
  controls.target.set(0.5, 0.5, 0)
  controls.enableDamping = true
  controls.zoomSpeed = 0.5
}

function render() {
  if (cameraState === 'persp' && controls) {
    controls.update()
  }
  composer.render()
}

const init = async () => {
  createScene()
  // TODO ::: check, no seed
  await generateHair()
  updateMeshes()
  updateSize()
  createOrbitControls()
  createComposer()
  animate()
}

function animate() {
  requestAnimationFrame(animate)
  controls?.update()
  render()
}

export const clearScene = () => {
  removeMeshes(group)
  clearGeoGroup()
}

export function updateMeshes() {
  // TODOOO important, remove meshes
  removeMeshes(group)
  const materials = new Array(5).fill(undefined).map(() => {
    const mat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      side: THREE.FrontSide,
    })
    return mat
  })
  createMeshes(group, materials, { shadow: true })
}

export const setLightAngle = (v: number) => {
  const angle = (v / 180) * Math.PI
  directionalLight.position.set(0.5 + Math.cos(angle), 0.5, Math.sin(angle))
}

init()
