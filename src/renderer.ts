import * as THREE from 'three'
import { Vector3 } from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'

let scene = new THREE.Scene()
const HELPERS = false
scene.background = new THREE.Color(0x999999)

// tuple: x, y, z, radius
const path = [
  [0.2, 0, 0, 0.3],
  [0, -1, 0.2, 0.3],
  [0.2, -2, 0, 0.3],
  [0, -3, 0.1, 0.3],
  [0.1, -4, 0, 0.2],
  [0, -5, 0.3, 0.1],
]

createMesh(path, scene)

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

function createMesh(path, scene: THREE.Scene) {
  const geo = new THREE.BufferGeometry()

  const vertices = []
  const numPoints = 8
  const step = (2 * Math.PI) / numPoints
  const numLayers = path.length

  for (let j = 0; j < numLayers; ++j) {
    // get direction
    let dir1, dir2, dir
    let point = new THREE.Vector3(path[j][0], path[j][1], path[j][2])
    let radius = path[j][3]

    if (j > 0) {
      let prev = new THREE.Vector3(
        path[j - 1][0],
        path[j - 1][1],
        path[j - 1][2]
      )
      dir1 = new THREE.Vector3().subVectors(point, prev)
    }

    if (j < numLayers - 1) {
      let next = new THREE.Vector3(
        path[j + 1][0],
        path[j + 1][1],
        path[j + 1][2]
      )
      dir2 = new THREE.Vector3().subVectors(next, point)
    }

    dir = dir1 || dir2
    if (dir1 && dir2) {
      dir = new THREE.Vector3().addVectors(dir1, dir2)
    }

    // two base vectors
    let v1 = new Vector3().crossVectors(dir, new Vector3(1, 0, 0)).normalize()
    let v2 = new Vector3().crossVectors(dir, v1).normalize()

    // TODO ::: optimize
    for (let i = 0; i < numPoints; ++i) {
      let vert = new Vector3()
        .addVectors(
          v1.clone().multiplyScalar(radius * Math.cos(step * i)),
          v2.clone().multiplyScalar(radius * Math.sin(step * i))
        )
        .add(point)
      vertices.push([vert.x, vert.y, vert.z])
      // let vert = new THREE.Vector3().addVectors(baseVert, new Vector3(radius * Math.cos(step * i), 0, radius * Math.sin(step * i)))
      // vertices.push([vert.x, vert.y, vert.z])
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
  geo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices.flat(), 3)
  )
  geo.computeVertexNormals()

  const material = new THREE.MeshPhongMaterial()

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
