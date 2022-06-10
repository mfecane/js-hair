import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import { saveAs } from 'file-saver'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { generateHair, getGroups } from './hair-meshes'

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

const createScene = () => {
  scene = new THREE.Scene()
  group = new THREE.Group()
  scene.add(group)
  // scene.background = new THREE.Color(0x999999)
  addPlane()

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(1.0, 1.0, 1.0)
  scene.add(directionalLight)

  // TODO ::: make occlution by casting light from different directions
  perspCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000)
  perspCamera.position.set(0.5, 0.5, 2)
  perspCamera.lookAt(0.5, 0.5, 0)

  orthoCamera = new THREE.OrthographicCamera(0, 1, 1, 0, -0.1, 0.1)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height)
  window.addEventListener('resize', updateSize)

  renderer.setPixelRatio(window.devicePixelRatio)
}

const addPlane = () => {
  const geometry = new THREE.PlaneGeometry(1, 1)
  const material = new THREE.MeshBasicMaterial({
    color: 0x666666,
    side: THREE.DoubleSide,
  })
  const plane = new THREE.Mesh(geometry, material)
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

  const pass = new SMAAPass(
    width * renderer.getPixelRatio(),
    height * renderer.getPixelRatio()
  )
  composer.addPass(pass)
}

function createOrbitControls() {
  controls = new OrbitControls(perspCamera, renderer.domElement)
  controls.minDistance = 0.5
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

function init() {
  createScene()
  generateHair()
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

export function updateMeshes() {
  const groups = getGroups()
  groups.forEach((g) => {
    group.add(g)
  })
}

init()
