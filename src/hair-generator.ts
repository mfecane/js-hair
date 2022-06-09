import { map, mapclamp, smoothstep } from './lib'
import * as THREE from 'three'
import { Vector3 } from 'three'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'

// TODO ::: add createSpline

type HairPoint = {
  pos: [number, number, number]
  // col: [number, number, number] // TODO
  width: number
}

type Rect = {
  x: number
  y: number
  w: number
  h: number
}

interface HairGeneratorOptions {
  rect: Rect
  density?: number
  clampCount?: number
  width?: number
}

const standardMaterials = [
  new THREE.MeshStandardMaterial({ color: 0xbbbbbb }),
  new THREE.MeshStandardMaterial({ color: 0xcccccc }),
  new THREE.MeshStandardMaterial({ color: 0xdddddd }),
  new THREE.MeshStandardMaterial({ color: 0xeeeeee }),
  new THREE.MeshStandardMaterial({ color: 0xffffff }),
]

export class HairGenerator {
  clamps: HairPoint[][][] = []
  rect: Rect
  MAX_ORIGINS = 1500
  maxd = 0.01
  SEGMENTS = 40
  ELEVATION = 0.07
  width = 0.0005
  density = 0.5
  clampCount = 5
  // scene: THREE.Scene | null

  constructor(options: HairGeneratorOptions) {
    this.rect = options.rect
    // this.scene = scene

    this.density = options.density || this.density
    this.clampCount = options.clampCount || this.clampCount
    this.width = options.width || this.width

    this.createOrigins()
  }

  createOrigins() {
    let origins: [number, number, number][][] = []

    for (let i = 0; i < this.MAX_ORIGINS; ++i) {
      const originShift = 0.005
      const vSteps = 5
      const v = i % vSteps // vertical index 0 - vSteps
      const h = i / vSteps // horizontal index 0 - this.MAX_ORIGINS / vSteps
      const x = this.rect.x + (this.rect.w / this.MAX_ORIGINS) * h * vSteps
      const y = this.rect.y - originShift * v - Math.random() * originShift
      const clamp = Math.floor((i / this.MAX_ORIGINS) * this.clampCount)
      if (!origins[clamp]) {
        origins[clamp] = []
      }
      origins[clamp].push([x, y, 0])
    }

    origins = origins.map((o) =>
      o.filter(() => {
        return Math.random() < this.density
      })
    )

    // shuffle paths between clamps
    this.shuffleClamps(origins)
    this.clamps = origins.map((o) => this.createClamp(o))
  }

  shuffleClamps(origins: [number, number, number][][]) {
    let i = 0
    while (origins[i]) {
      if (origins[i - 1]) {
        this.moveItemsBetweenArrays(origins[i], origins[i - 1])
      }
      if (origins[i + 1]) {
        this.moveItemsBetweenArrays(origins[i], origins[i + 1])
      }
      ++i
    }
  }

  moveItemsBetweenArrays(
    arr1: [number, number, number][],
    arr2: [number, number, number][]
  ) {
    let i = 0
    while (arr1[i]) {
      if (Math.random() < 0.3) {
        this.moveItemBetweenArrays(arr1, arr2, i)
      }
      ++i
    }
  }

  moveItemBetweenArrays(
    arr1: [number, number, number][],
    arr2: [number, number, number][],
    index: number
  ) {
    const el = arr1[index]
    arr1.splice(index, 1)
    arr2.push(el)
  }

  createClamp(origins: [number, number, number][]) {
    // TODO
    // create base path per clamp group
    // attract paths in clamp group to
    // clamp base path

    const avgX =
      origins.reduce((acc, cur) => {
        return acc + cur[0]
      }, 0) / origins.length
    const avgZ = this.ELEVATION / 2

    const baseOrigin = [avgX, this.rect.y, avgZ]
    const basePath = this.createPath(baseOrigin)

    // base generator
    const paths = origins.map((o) => this.createPath(o))

    // clamp modifier
    paths.forEach((p) => {
      this.addPath(p, basePath, 0.9, (t) => profile1(t, 0.1, 0.7, 0.6))
    })

    return paths
  }

  addPath(
    p1: HairPoint[],
    p2: HairPoint[],
    weight: number,
    fn?: (t: number) => number
  ) {
    if (!fn) {
      fn = (t: number) => smoothstep(0, 1, t)
    }

    for (let i = 0; i < this.SEGMENTS; i++) {
      const t = i / this.SEGMENTS
      const k = fn(t) * weight
      p1[i].pos[0] = p1[i].pos[0] + (p2[i].pos[0] - p1[i].pos[0]) * k
      // ignore y in this case
      // p1[i].pos[1] = p1[i].pos[1] + (p2[i].pos[1] - p1[i].pos[1]) * k
      p1[i].pos[2] = p1[i].pos[2] + (p2[i].pos[2] - p1[i].pos[2]) * k
    }
  }

  createPath(origin: [number, number, number]) {
    let path = []
    // let point: HairPoint = {
    //   pos: [origin[0], origin[1], origin[2]],
    //   width: this.mapWidth(0, this.width),
    // }
    // path.push(point)
    const freq1 = Math.random() * 20 + 5
    const freq2 = Math.random() * 20 + 5
    const elev = Math.random() * this.ELEVATION
    const len = this.rect.h * (0.96 - Math.random() * 0.4)
    const phase = Math.random() * 20 * Math.PI

    for (let i = 0; i < this.SEGMENTS; ++i) {
      const t = i / this.SEGMENTS
      let point = {
        pos: [
          origin[0] + Math.sin(freq1 * t + phase) * this.maxd,
          origin[1] - t * len,
          origin[2] +
            Math.sin(freq2 * t + phase) * this.maxd +
            this.mapElev(t, elev),
        ],
        width: this.mapWidth(t, this.width),
      }
      path.push(point)
    }

    return path
  }

  mapWidth(t: number, maxWidth: number) {
    const root = 0.2
    if (t < root) {
      return maxWidth * map(t, 0, root, 0.5, 1.0)
    }
    const tip = 0.3
    if (t > 1 - tip) {
      return maxWidth * map(t, 1 - tip, 1, 1, 0.3)
    }

    return maxWidth
  }

  mapElev(t: number, height: number) {
    const tip = 0.12
    if (t < tip) {
      return height * Math.sqrt(t / tip)
    }
    return height
  }

  getPaths() {
    return this.clamps.flat()
  }

  createMeshes() {
    // const materials = [
    //   new THREE.MeshDepthMaterial({ color: 0xbbbbbb }),
    //   new THREE.MeshDepthMaterial({ color: 0xcccccc }),
    //   new THREE.MeshDepthMaterial({ color: 0xdddddd }),
    //   new THREE.MeshDepthMaterial({ color: 0xeeeeee }),
    //   new THREE.MeshDepthMaterial({ color: 0xffffff }),
    // ]

    const geos = this.clamps.flat().map((p) => this.createGeo(p))
    const meshes = geos.map((geo, index) => {
      const k = Math.floor(Math.random() * 5)
      const mat = standardMaterials[k]
      const mesh = new THREE.Mesh(geo, mat)
      mesh.name = `hair_${index}`
      // const helper = new VertexNormalsHelper(mesh, 0.05, 0x00ff00)
      // this.scene.add(helper)
      return mesh
    })
    return meshes
  }

  createGeo(path: HairPoint[]) {
    const geo = new THREE.BufferGeometry()

    const vertices = []
    const uvs = []
    const normals = []
    const numPoints = 8
    const angleStep = (2 * Math.PI) / numPoints
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

      // const arrowHelper = new THREE.ArrowHelper(
      //   dir?.normalize(),
      //   new Vector3(0, 0, 1).add(point),
      //   0.4
      // )
      // scene.add(arrowHelper)

      // two base vectors
      let v1 = new Vector3().crossVectors(dir, new Vector3(1, 0, 0)).normalize()
      let v2 = new Vector3().crossVectors(dir, v1).normalize()

      // check vectors
      // console.log('v1.length()', v1.length())
      // console.log('v2.length()', v2.length())
      // console.log('v1.dot(v2)', v1.dot(v2))

      // TODO ::: optimize
      // TODO ::: cache dirs, optimize

      // diplicate seam vertices
      for (let i = 0; i < numPoints + 1; ++i) {
        let normal = new Vector3().addVectors(
          v1.clone().multiplyScalar(Math.cos(angleStep * i)),
          v2.clone().multiplyScalar(Math.sin(angleStep * i))
        )

        let vert = normal.clone().multiplyScalar(radius).add(point)
        vertices.push([vert.x, vert.y, vert.z])

        const u = map(i / numPoints, 0, 1, 0.01, 0.99)
        const v = map(j / (numLayers - 1), 0, 1, 0.01, 0.99)
        uvs.push([u, v])

        normals.push(normal.toArray())
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
        indices.push(getIndiciForLayer(i, j, numPoints + 1))
      }
    }

    indices = indices.flat()

    geo.setIndex(indices)
    geo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices.flat(), 3)
    )
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs.flat(), 2))
    geo.setAttribute(
      'normal',
      new THREE.Float32BufferAttribute(normals.flat(), 3)
    )
    return geo
  }
}

// 0 at the root, 1 at the tip , weight in the middle
// TODO use spline
const profile1 = (t: number, root: number, tip: number, weight: number) => {
  if (t < root) {
    return smoothstep(0, root, t) * weight
  }
  if (t > tip) {
    return weight + (1 - weight) * smoothstep(tip, 1, t)
  }
  return weight
}
