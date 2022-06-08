import { map, mapclamp, smoothstep } from './lib'

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
}

export class HairGenerator {
  clamps: HairPoint[][][] = []
  rect: Rect
  CLAMPS_COUNT = 8
  MAX_ORIGINS = 1000
  maxd = 0.01
  SEGMENTS = 40
  ELEVATION = 0.07
  width = 0.001
  density = 0.2

  constructor(options: HairGeneratorOptions) {
    this.rect = options.rect
    if (options.density) {
      this.density = options.density * 0.5
    }
    this.createOrigins()
  }

  createOrigins() {
    let origins: [number, number, number][][] = []

    for (let i = 0; i < this.MAX_ORIGINS; ++i) {
      const originShift = 0.01
      const vSteps = 5
      const v = i % vSteps // vertical index 0 - vSteps
      const h = i / vSteps // horizontal index 0 - this.MAX_ORIGINS / vSteps
      const x = this.rect.x + (this.rect.w / this.MAX_ORIGINS) * h * vSteps
      const y = this.rect.y - originShift * v - Math.random() * originShift
      const clamp = Math.floor((i / this.MAX_ORIGINS) * this.CLAMPS_COUNT)
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
    const avgY = this.ELEVATION / 2

    // base generator
    const paths = origins.map((o) => this.createPath(o))

    // clamp modifier
    paths.forEach((p) => {
      p.forEach((point, index, arr) => {
        const t = index / arr.length
        const weight = smoothstep(0.2, 0.7, t) * 0.8
        point.pos[0] = point.pos[0] + (avgX - point.pos[0]) * weight
        point.pos[2] = point.pos[2] + (avgY - point.pos[2]) * weight
      })
    })

    return paths
  }

  createPath(origin: [number, number, number]) {
    let path = []
    let point: HairPoint = {
      pos: [origin[0], origin[1], origin[2]],
      width: this.width,
    }
    path.push(point)
    const freq1 = Math.random() * 20 + 5
    const freq2 = Math.random() * 20 + 5
    const elev = Math.random() * this.ELEVATION
    const len = this.rect.h * 0.96

    for (let i = 0; i < this.SEGMENTS; ++i) {
      const t = i / this.SEGMENTS
      point = {
        pos: [
          origin[0] + Math.sin(freq1 * t) * this.maxd,
          origin[1] - t * len,
          origin[2] + Math.sin(freq2 * t) * this.maxd + this.mapElev(t, elev),
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

  addToScene() {
    // TODO ::: implemnent
  }
}
