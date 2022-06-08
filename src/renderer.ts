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

let card1 = new HairGenerator({
  rect: {
    x: 0.01,
    y: 0.99,
    w: 0.2,
    h: 1,
  },
  density: 0.5,
})
let paths = card1.getPaths()
paths.forEach((p) => createMesh(p, scene))

let card2 = new HairGenerator({
  rect: {
    x: 0.23,
    y: 0.99,
    w: 0.2,
    h: 1,
  },
  density: 0.3,
})
let paths2 = card2.getPaths()
paths2.forEach((p) => createMesh(p, scene))

let card3 = new HairGenerator({
  rect: {
    x: 0.45,
    y: 0.99,
    w: 0.15,
    h: 1,
  },
  density: 0.2,
})
let paths3 = card3.getPaths()
paths3.forEach((p) => createMesh(p, scene))

let card4 = new HairGenerator({
  rect: {
    x: 0.63,
    y: 0.99,
    w: 0.1,
    h: 1,
  },
  density: 0.1,
})
let paths4 = card4.getPaths()
paths4.forEach((p) => createMesh(p, scene))

let card5 = new HairGenerator({
  rect: {
    x: 0.76,
    y: 0.99,
    w: 0.05,
    h: 1,
  },
  density: 0.05,
})
let paths5 = card5.getPaths()
paths5.forEach((p) => createMesh(p, scene))

let card6 = new HairGenerator({
  rect: {
    x: 0.86,
    y: 0.99,
    w: 0.05,
    h: 1,
  },
  density: 0.02,
})
let paths6 = card6.getPaths()
paths6.forEach((p) => createMesh(p, scene))

let card7 = new HairGenerator({
  rect: {
    x: 0.94,
    y: 0.99,
    w: 0.05,
    h: 1,
  },
  density: 0.01,
})
let paths7 = card7.getPaths()
paths7.forEach((p) => createMesh(p, scene))

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

camera.position.set(0.5, -0.5, 2)
camera.lookAt(0.5, -0.5, 0)

const orthoCamera = new THREE.OrthographicCamera(0, 1, 1, 0, -1, 0.5)

const renderer = new THREE.WebGLRenderer({ antialias: true })
const controls = new OrbitControls(camera, renderer.domElement)

controls.minDistance = 0.5
controls.maxDistance = 5
controls.target.set(0.5, -0.5, 0)
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

function createMesh(path, scene: THREE.Scene) {
  const geo = new THREE.BufferGeometry()

  const vertices = []
  const numPoints = 8
  const step = (2 * Math.PI) / numPoints
  const numLayers = path.length

  for (let j = 0; j < numLayers; ++j) {
    // get direction

    let dir1, dir2, dir
    let point = new THREE.Vector3(
      path[j].pos[0],
      path[j].pos[1],
      path[j].pos[2]
    )
    let radius = path[j].width

    if (j > 0) {
      let prev = new THREE.Vector3(
        path[j - 1].pos[0],
        path[j - 1].pos[1],
        path[j - 1].pos[2]
      )
      dir1 = new THREE.Vector3().subVectors(point, prev)
    }

    if (j < numLayers - 1) {
      let next = new THREE.Vector3(
        path[j + 1].pos[0],
        path[j + 1].pos[1],
        path[j + 1].pos[2]
      )
      dir2 = new THREE.Vector3().subVectors(next, point)
    }

    dir = dir1 || dir2
    if (dir1 && dir2) {
      dir = new THREE.Vector3().addVectors(dir1, dir2)
    }

    if (HELPERS) {
      // const arrowHelper = new THREE.ArrowHelper(
      //   dir?.normalize(),
      //   new Vector3(0, 0, 1).add(point),
      //   0.4
      // )
      // scene.add(arrowHelper)
    }

    // two base vectors
    let v1 = new Vector3().crossVectors(dir, new Vector3(1, 0, 0)).normalize()
    let v2 = new Vector3().crossVectors(dir, v1).normalize()

    // TODO ::: optimize
    // TODO ::: cache dirs, optimize
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

  // TODO ::: dont copy material
  const material = new THREE.MeshPhongMaterial()

  const mesh = new THREE.Mesh(geo, material)

  scene.add(mesh)

  if (HELPERS) {
    // const helper = new VertexNormalsHelper(mesh, 0.1, 0x00ff00)
    // scene.add(helper)
    // const axesHelper = new THREE.AxesHelper(0.5)
    // scene.add(axesHelper)
    // r - x
    // g - y
    // b - z
  }
}

function render() {
  renderer.render(scene, orthoCamera)
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
