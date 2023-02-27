import { map, smoothstep } from '../lib/lib'
import * as THREE from 'three'
import { Vector3 } from 'three'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'
import { groupBy } from 'lodash'
import { rand } from 'src/lib/random'

// TODO ::: add createSpline

type HairPoint = {
  pos: [number, number, number]
  // col: [number, number, number] // TODO
  width: number
}

type THairPath = HairPoint[]

export type TGeo = THREE.BufferGeometry

type Rect = {
  x: number
  y: number
  w: number
  h: number
}

type Required<T> = {
  [P in keyof T]-?: T[P]
}

interface HairGeneratorOptions {
  rect: Rect
  density?: number
  clampCount?: number
  width?: number
  stray?: number
  variance?: number
  lengthVariance?: number
}

type HairGeneratorOptionsAll = Required<HairGeneratorOptions>

export class HairGenerator {
  // flatten here?
  paths: THairPath[] = []
  geos: THREE.BufferGeometry[] = []
  MAX_ORIGINS = 1500
  variance = 0.01
  SEGMENTS = 20
  ELEVATION = 0.1

  private readonly options: HairGeneratorOptionsAll

  private static readonly DEFAULTS: HairGeneratorOptionsAll = {
    rect: {
      x: 0.05,
      y: 0.95,
      w: 0.9,
      h: 0.9,
    },
    lengthVariance: 0.05,
    variance: 0.02,
    width: 0.0005,
    density: 0.5,
    clampCount: 5,
    stray: 0.3,
  }

  public constructor(optionsParam: HairGeneratorOptions) {
    this.options = {
      ...HairGenerator.DEFAULTS,
      ...optionsParam,
    }

    this.createClamps()
    this.createMeshes()
  }

  createClamps() {
    type TOrigin = {
      clampId: number | null
      point: [number, number, number]
    }
    let origins: TOrigin[] = []

    const originShift = 0.005
    const vSteps = 5

    for (let i = 0; i < this.MAX_ORIGINS; i += vSteps) {
      for (let j = 0; j < vSteps; ++j) {
        const x =
          this.options.rect.x + (this.options.rect.w / this.MAX_ORIGINS) * i
        const y = this.options.rect.y - originShift * j - rand() * originShift

        let clampId: number | null = Math.floor(
          (i / this.MAX_ORIGINS) * this.options.clampCount
        )
        const seed = rand()

        const shuffle = 0.5

        if (seed < 0.2 * shuffle) {
          // move up
          clampId = clampId > 0 ? clampId - 1 : clampId
        } else if (seed < 0.4 * shuffle) {
          // move down
          clampId =
            clampId < this.options.clampCount - 1 ? clampId + 1 : clampId
        } else if (seed < 0.4 * shuffle + 0.4 * this.options.stray) {
          // stray
          clampId = null
        }

        const origin: TOrigin = {
          clampId,
          point: [x, y, 0],
        }

        origins.push(origin)
      }
    }

    // remove some origins
    origins = origins.filter((origin) => {
      const factor = 1 - this.diff(origin.point[0], 0.5, 1.0)
      return rand() < this.options.density * factor
    })

    const obj = groupBy(origins, (el: TOrigin) => {
      return el.clampId
    })

    // bullshit
    this.paths = Object.keys(obj)
      .map((key) => {
        let origPoints = obj[key].map((el: TOrigin) => el.point)
        if (key === 'null') {
          return this.createStray(origPoints)
        }
        return this.createClamp(origPoints)
      })
      .filter((cl) => !!cl)
      .flat()
  }

  private diff(a: number, b: number, scale: number): number {
    return Math.abs(a - b) / scale
  }

  private createAveragePoint(
    points: [number, number, number][]
  ): [number, number, number] {
    const avgX =
      points.reduce((acc, cur) => {
        return acc + cur[0]
      }, 0) / points.length
    const avgZ = this.ELEVATION / 2
    return [avgX, this.options.rect.y, avgZ]
  }

  private createClamp(origins: [number, number, number][]): THairPath[] {
    const baseOrigin = this.createAveragePoint(origins)
    const basePath = this.createPath(baseOrigin)

    // we want clamps lower lowering clamp control path
    this.movePathLower(basePath, 0.5)

    // base generator
    const paths = origins.map((o) => this.createPath(o))

    // clamp modifier
    paths.forEach((p) => {
      this.addPath(p, basePath, 0.9, (t) => profile1(t, 0.35, 0.8, 0.8))
    })

    return paths
  }

  private movePathLower(path: HairPoint[], amount: number): void {
    path.forEach((el) => {
      el.pos[2] = el.pos[2] * amount
    })
  }

  private createStray(origins: [number, number, number][]): THairPath[] {
    const paths = origins.map((o) => this.createPath(o))
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

  private createPath(origin: [number, number, number]): THairPath {
    let path = []

    const freq1 = rand() * 20 + 5
    const freq2 = rand() * 20 + 5
    const elev = rand() * this.ELEVATION
    const length =
      this.options.rect.h * (0.96 - rand() * this.options.lengthVariance)
    const phase = rand() * 20 * Math.PI
    const varRand = (0.5 + 0.5 * rand()) * this.options.variance

    for (let i = 0; i < this.SEGMENTS; ++i) {
      const t = i / this.SEGMENTS
      let w = this.mapWidth(t, this.options.width)
      let x = origin[0] + Math.sin(freq1 * t + phase) * varRand
      let y = origin[1] - t * length
      let z = elev + Math.sin(freq2 * t + phase) * varRand
      z *= this.mapElev(t)
      // clamp z to avoid clipping with the plane underneath
      z = z < w ? w : z

      let point: {
        pos: [number, number, number]
        width: number
      } = {
        pos: [x, y, z],
        width: w,
      }
      path.push(point)
    }

    return this.filterEndsOut(path)
  }

  private filterEndsOut(path: THairPath): THairPath {
    if (rand() > 0.5) {
      return path
    }

    const origin = path[0]
    const factor =
      (origin.pos[0] - 0.5) * (origin.pos[0] - 0.5) * rand() * 1.3
    path.forEach((point) => {
      const factorZ = 1 - point.pos[1]
      point.pos[0] += Math.sin(point.pos[0] - 0.5) * factor * factorZ
      point.pos[1] = point.pos[1] + (1.0 - point.pos[1]) * factor
    })
    return path
  }

  // form of the hair
  mapWidth(t: number, maxWidth: number) {
    const rootEnd = 0.1
    const rootWidth = 0.5
    if (t < rootEnd) {
      return maxWidth * map(t, 0, rootEnd, 0.7, rootWidth)
    }
    const tipEnd = 0.8
    const tipWidth = 0.3
    if (t > 1 - tipEnd) {
      return maxWidth * map(t, 1 - tipEnd, 1, 1, tipWidth)
    }

    return maxWidth
  }

  mapElev(t: number) {
    const tip = 0.12
    if (t < tip) {
      return Math.sqrt(t / tip)
    }
    return 1
  }

  createMeshes() {
    this.geos = this.paths.map((p) => this.createGeo(p))
  }

  getGeo() {
    return this.geos
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
