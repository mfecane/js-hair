import * as THREE from 'three'
import { Vector3 } from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'
import { HairGenerator } from './hair-generator'
import { map, smoothstep } from './lib'

let scene = new THREE.Scene()
const HELPERS = true
let orbitControlState = true
scene.background = new THREE.Color(0x999999)

const geometry = new THREE.PlaneGeometry(1, 1)
const material = new THREE.MeshBasicMaterial({
  color: 0x666666,
  side: THREE.DoubleSide,
})
const plane = new THREE.Mesh(geometry, material)
plane.position.set(0.5, 0.5, 0.0)
scene.add(plane)

let meshes = []
let card1 = new HairGenerator({
  rect: {
    x: 0.01,
    y: 0.99,
    w: 0.2,
    h: 1,
  },
  density: 0.5,
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
  scene.add(m)
})

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)

directionalLight.position.set(1.0, 1.0, 1.0)

// const directionalLightHelper = new THREE.DirectionalLightHelper(
//   directionalLight,
//   0.2
// )
// scene.add(directionalLightHelper)
scene.add(directionalLight)

const camera = new THREE.PerspectiveCamera(
  45,
  innerWidth / innerHeight,
  0.1,
  2000
)

camera.position.set(0.5, 0.5, 2)
camera.lookAt(0.5, 0.5, 0)

const orthoCamera = new THREE.OrthographicCamera(0, 1, 1, 0, -0.1, 0.1)

const renderer = new THREE.WebGLRenderer({ antialias: true })
// const controls = new OrbitControls(camera, renderer.domElement)

// controls.minDistance = 0.5
// controls.maxDistance = 5
// controls.target.set(0.5, 0.5, 0)
// controls.enableDamping = true
// controls.zoomSpeed = 0.5

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)

animate()

document.body.appendChild(renderer.domElement)

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

function toggleOrbitControls(state) {
  if (typeof state !== 'undefined') {
    orbitControlState = state
  } else {
    orbitControlState = !orbitControlState
  }

  if (orbitControlState) {
    // TODO :: do something
  }
}

function render() {
  // renderer.render(scene, camera)
  renderer.render(scene, orthoCamera)
}

function animate() {
  requestAnimationFrame(animate)
  // directionalLight.position.set(
  //   camera.position.x,
  //   camera.position.y,
  //   camera.position.z
  // )
  // controls.update()
  render()
}
