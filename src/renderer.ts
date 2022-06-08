import * as THREE from 'three'
import { Vector3 } from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'
import { HairGenerator } from './hair-generator'
import { map, smoothstep } from './lib'
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter'
import { saveAs } from 'file-saver'

let element: HTMLDivElement
let scene = new THREE.Scene()
let group = new THREE.Group()
scene.add(group)
let controls: OrbitControls | null
const HELPERS = true
export type CameraState = 'ortho' | 'persp'
let cameraState: CameraState = 'ortho'
scene.background = new THREE.Color(0x999999)

const geometry = new THREE.PlaneGeometry(1, 1)
const material = new THREE.MeshBasicMaterial({
  color: 0x666666,
  side: THREE.DoubleSide,
})
const plane = new THREE.Mesh(geometry, material)
plane.position.set(0.5, 0.5, 0.0)
scene.add(plane)

// TODO ::: make occlution by casting light from different directions

let meshes: THREE.Mesh<THREE.BufferGeometry, any>[][] = []

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)

directionalLight.position.set(1.0, 1.0, 1.0)

// const directionalLightHelper = new THREE.DirectionalLightHelper(
//   directionalLight,
//   0.2
// )
// scene.add(directionalLightHelper)
scene.add(directionalLight)

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000)

camera.position.set(0.5, 0.5, 2)
camera.lookAt(0.5, 0.5, 0)

const orthoCamera = new THREE.OrthographicCamera(0, 1, 1, 0, -0.1, 0.1)

const renderer = new THREE.WebGLRenderer({ antialias: true })

renderer.setPixelRatio(window.devicePixelRatio)
// renderer.setSize(window.innerWidth, window.innerHeight)
window.addEventListener('resize', updateSize)

init()

// window.setTimeout(() => {
//   exportObj()
// }, 1000)

export const mount = (el: HTMLDivElement) => {
  element = el
  updateSize()
  element.appendChild(renderer.domElement)
}

// function drawDot(vec: Vector3) {
//   var dotGeometry = new THREE.BufferGeometry()
//   dotGeometry.setAttribute(
//     'position',
//     new THREE.Float32BufferAttribute([vec.x, vec.y, vec.z], 3)
//   )
//   var dotMaterial = new THREE.PointsMaterial({
//     size: 4,
//     sizeAttenuation: false,
//   })
//   var dot = new THREE.Points(dotGeometry, dotMaterial)
//   scene.add(dot)
// }

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

export function toggleCameraState(state: CameraState) {
  if (cameraState === state) {
    return
  }

  cameraState = state

  if (cameraState === 'persp') {
    if (!controls) {
      createOrbitControls()
    }
  }
}

function updateSize() {
  camera.updateProjectionMatrix()
  const rect = element.getBoundingClientRect()
  const min = Math.min(rect.width, rect.height)
  renderer.setSize(min, min)
}

function createOrbitControls() {
  controls = new OrbitControls(camera, renderer.domElement)
  controls.minDistance = 0.5
  controls.maxDistance = 5
  controls.target.set(0.5, 0.5, 0)
  controls.enableDamping = true
  controls.zoomSpeed = 0.5
}

function render() {
  if (cameraState === 'ortho') {
    renderer.render(scene, orthoCamera)
    if (controls) {
      controls.dispose()
      controls = null
    }
  }
  if (cameraState === 'persp') {
    renderer.render(scene, camera)
    if (controls) {
      controls.update()
    }
  }
}

function init() {
  createOrbitControls()
  animate()
}

export function generateHair() {
  return new Promise((resolve) => {
    meshes = []

    let object
    while (true) {
      object = group.children[0] as THREE.Mesh
      if (!object) {
        break
      }
      object.geometry.dispose()
      object.material.dispose()
      group.remove(object)
      renderer.renderLists.dispose()
    }

    let card1 = new HairGenerator({
      rect: {
        x: 0.01,
        y: 0.99,
        w: 0.2,
        h: 1,
      },
      density: 0.4,
    })
    meshes.push(card1.createMeshes())

    let card2 = new HairGenerator({
      rect: {
        x: 0.23,
        y: 0.99,
        w: 0.2,
        h: 1,
      },
      density: 0.3,
    })
    meshes.push(card2.createMeshes())

    let card3 = new HairGenerator({
      rect: {
        x: 0.45,
        y: 0.99,
        w: 0.15,
        h: 1,
      },
      density: 0.2,
    })
    meshes.push(card3.createMeshes())

    let card4 = new HairGenerator({
      rect: {
        x: 0.63,
        y: 0.99,
        w: 0.1,
        h: 1,
      },
      density: 0.1,
    })
    meshes.push(card4.createMeshes())

    let card5 = new HairGenerator({
      rect: {
        x: 0.76,
        y: 0.99,
        w: 0.05,
        h: 1,
      },
      density: 0.05,
    })
    meshes.push(card5.createMeshes())

    let card6 = new HairGenerator({
      rect: {
        x: 0.86,
        y: 0.99,
        w: 0.05,
        h: 1,
      },
      density: 0.02,
    })
    meshes.push(card6.createMeshes())

    let card7 = new HairGenerator({
      rect: {
        x: 0.94,
        y: 0.99,
        w: 0.05,
        h: 1,
      },
      density: 0.01,
    })
    meshes.push(card7.createMeshes())

    meshes.flat().forEach((m) => {
      group.add(m)
    })
    resolve(null)
  })
}

function animate() {
  requestAnimationFrame(animate)
  controls?.update()
  render()
}
