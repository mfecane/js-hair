import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

let scene: THREE.Scene
let renderer: THREE.WebGLRenderer
let camera: THREE.PerspectiveCamera
let root: HTMLDivElement
let width: number
let height: number
let ready = false
let controls: OrbitControls

export const mount = (selector: string) => {
  root = document.querySelector(selector) as HTMLDivElement
  if (!root) throw new Error('Element not found')
  if (!renderer?.domElement) throw new Error('Renderer not available')
  root.appendChild(renderer.domElement)
  updateSize()
}

export const unmount = () => {
  root.removeChild(renderer.domElement)
  renderer.dispose()
  camera.clear()
  scene.clear()
  controls.dispose()
  ready = false
}

const updateSize = () => {
  const rect = root.getBoundingClientRect()
  width = rect.width
  height = rect.height
  renderer.setSize(width, height)
}

export const init = () => {
  scene = new THREE.Scene()
  renderer = new THREE.WebGLRenderer({ antialias: true })

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000)
  camera.position.set(0, 0, -2)
  camera.lookAt(0, 0, 0)

  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height)
  ready = true

  controls = new OrbitControls(camera, renderer.domElement)
  controls.minDistance = 1
  controls.maxDistance = 5
  controls.target.set(0, 0, 0)
  controls.enableDamping = true
  controls.zoomSpeed = 0.5

  const axesHelper = new THREE.AxesHelper(0.5)
  scene.add(axesHelper)

  populateGeometry()

  update()
}

const populateGeometry = () => {
  const geometry = new THREE.CircleGeometry(0.3, 12)
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
  const circle = new THREE.Mesh(geometry, material)
  scene.add(circle)
}

const update = () => {
  if (ready) {
    renderer.render(scene, camera)
    requestAnimationFrame(update)
  }
}
