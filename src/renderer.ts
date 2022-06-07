import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'

const scene = new THREE.Scene()
const HELPERS = false
scene.background = new THREE.Color(0x999999)

createMesh(scene)

const directionalLight = new THREE.DirectionalLight(0xffffdd, 0.3)

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

camera.position.set(0, 0, 2)
camera.lookAt(0, 0, 0)

const renderer = new THREE.WebGLRenderer({ antialias: true })
const controls = new OrbitControls(camera, renderer.domElement)

controls.minDistance = 9
controls.maxDistance = 22
controls.target.set(0, 0, 0)
controls.enableDamping = true
controls.zoomSpeed = 0.5

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)

animate()

document.body.appendChild(renderer.domElement)

function createMesh(scene: THREE.Scene) {
  const geo = new THREE.BufferGeometry()

  const vertices = []
  const numPoints = 8
  const step = (2 * Math.PI) / numPoints
  const radius = 0.2
  const numLayers = 20
  const layerHeight = 0.5

  for (let j = 0; j < numLayers; ++j) {
    for (let i = 0; i < numPoints; ++i) {
      vertices.push(
        radius * Math.cos(step * i),
        -layerHeight * j,
        radius * Math.sin(step * i)
      )
    }
  }

  let indices = []

  const getIndiciForLayer = (
    index: number,
    layer: number,
    numPoints: number
  ) => {
    const arr = []
    let a, b, c

    // should wrap
    if (index === numPoints - 1) {
      // tri #1
      a = layer * numPoints + index
      b = layer * numPoints + 0
      c = (layer + 1) * numPoints + index

      arr.push(a, b, c)

      // tri #2
      a = layer * numPoints + 0
      b = (layer + 1) * numPoints + 0
      c = (layer + 1) * numPoints + index

      arr.push(a, b, c)

      return arr
    }

    // tri #1
    a = layer * numPoints + index
    b = layer * numPoints + index + 1
    c = (layer + 1) * numPoints + index

    arr.push(a, b, c)

    // tri #2
    a = layer * numPoints + index + 1
    b = (layer + 1) * numPoints + index + 1
    c = (layer + 1) * numPoints + index

    arr.push(a, b, c)

    return arr
  }

  for (let j = 0; j < numLayers - 1; ++j) {
    for (let i = 0; i < numPoints; ++i) {
      indices.push(getIndiciForLayer(i, j, numPoints))
    }
  }

  indices = indices.flat()

  geo.setIndex(indices)
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

  const material = new THREE.MeshPhongMaterial()

  geo.computeVertexNormals()
  const mesh = new THREE.Mesh(geo, material)

  scene.add(mesh)

  if (HELPERS) {
    const helper = new VertexNormalsHelper(mesh, 0.1, 0x00ff00)
    scene.add(helper)

    const axesHelper = new THREE.AxesHelper(0.5)
    scene.add(axesHelper)
  }
}

function render() {
  renderer.render(scene, camera)
}

function animate() {
  requestAnimationFrame(animate)
  directionalLight.position.set(
    camera.position.x,
    camera.position.y,
    camera.position.z
  )
  controls.update()
  render()
}
