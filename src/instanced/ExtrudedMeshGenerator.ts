import { cloneDeep } from 'lodash'
import { map } from 'src/lib/lib'
import * as THREE from 'three'
import { BufferGeometry, Vector3 } from 'three'

export type FiberPoint = {
  position: [x: number, y: number, z: number]
  width: number
}

export type FiberCurve = FiberPoint[]

export type BufferChunk = {
  vertices: [number, number, number][]
  uvs: [number, number][]
  uvs2: [number, number][]
  normals: [number, number, number][]
  indices: number[][]
  offsets: number[]
}

export type ExtrudedMeshGeneratorOptions = {
  minx: number
  miny: number
  maxx: number
  maxy: number
  sizex: number
  sizey: number
}

export class MeshPrototypeGenerator {
  private static readonly SIDE_SEGMENTS = 3

  public prototypes: BufferChunk[] = []

  public createFromCurves(curves: FiberCurve[]) {
    this.prototypes = curves.map((curve) => this.addCurve(curve))
  }

  public addCurve(path: FiberCurve): BufferChunk {
    const vertices: BufferChunk['vertices'] = []
    const uvs: BufferChunk['uvs'] = []
    const uvs2: BufferChunk['uvs2'] = []
    const normals: BufferChunk['normals'] = []
    const indices: BufferChunk['indices'] = []
    const offsets: BufferChunk['offsets'] = []
    const sideSegments = MeshPrototypeGenerator.SIDE_SEGMENTS

    const angleStep = (2 * Math.PI) / sideSegments
    const LENGTH_SEGMENTS = path.length

    const pathBase = path[0].position

    for (let j = 0; j < LENGTH_SEGMENTS; ++j) {
      let dir1: Vector3 = new THREE.Vector3()
      let dir2: Vector3 = new THREE.Vector3()
      let dir: Vector3 = new THREE.Vector3()
      let point = new THREE.Vector3(
        path[j].position[0],
        path[j].position[1],
        path[j].position[2]
      )
      let radius = path[j].width

      if (j > 0) {
        let prev = new THREE.Vector3(
          path[j - 1].position[0],
          path[j - 1].position[1],
          path[j - 1].position[2]
        )
        dir1 = new THREE.Vector3().subVectors(point, prev)
      }

      if (j < LENGTH_SEGMENTS - 1) {
        let next = new THREE.Vector3(
          path[j + 1].position[0],
          path[j + 1].position[1],
          path[j + 1].position[2]
        )
        dir2 = new THREE.Vector3().subVectors(next, point)
      }

      dir = dir1 || dir2
      if (dir1 && dir2) {
        dir = new THREE.Vector3().addVectors(dir1, dir2)
      }

      let v1 = new Vector3().crossVectors(dir, new Vector3(1, 0, 0)).normalize()
      let v2 = new Vector3().crossVectors(dir, v1).normalize()

      for (let i = 0; i < sideSegments + 1; ++i) {
        let normal = new Vector3().addVectors(
          v1.clone().multiplyScalar(Math.cos(angleStep * i)),
          v2.clone().multiplyScalar(Math.sin(angleStep * i))
        )

        let vert = normal.clone().multiplyScalar(radius).add(point)
        vertices.push([vert.x, vert.y, vert.z])

        const u = map(i / sideSegments, 0, 1, 0.01, 0.99)
        const v = map(j / (LENGTH_SEGMENTS - 1), 0, 1, 0.01, 0.99)
        uvs.push([u, v])

        uvs2.push([pathBase[0] / 6 + 0.5, pathBase[2] / 6 + 0.5])

        normals.push(normal.toArray())
        offsets.push(j / LENGTH_SEGMENTS)
      }
    }

    for (let j = 0; j < LENGTH_SEGMENTS - 1; ++j) {
      for (let i = 0; i < sideSegments; ++i) {
        indices.push(this.getIndiciForLayer(i, j, sideSegments + 1))
      }
    }

    return {
      vertices,
      uvs,
      uvs2,
      normals,
      indices,
      offsets,
    }
  }

  private getIndiciForLayer(
    index: number,
    layer: number,
    numPoints: number
  ): number[] {
    const arr: number[] = []
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
}

export class ExtrudedMeshGenerator {
  public bufferGeometry?: BufferGeometry
  private readonly options: ExtrudedMeshGeneratorOptions
  private readonly meshPrototypeGenerator: MeshPrototypeGenerator
  private static readonly defaults: ExtrudedMeshGeneratorOptions = {
    minx: -0.5,
    miny: -0.5,
    maxx: 0.5,
    maxy: 0.5,
    sizex: 0.02,
    sizey: 0.02,
  } // rect + density

  public constructor(options?: Partial<ExtrudedMeshGeneratorOptions>) {
    this.options = { ...ExtrudedMeshGenerator.defaults, ...options }
    this.meshPrototypeGenerator = new MeshPrototypeGenerator()
  }

  public setCurves(curves: FiberCurve[]) {
    this.meshPrototypeGenerator.createFromCurves(curves)
  }

  public populateShape() {
    const { minx, miny, maxx, maxy, sizex, sizey } = this.options

    const singleChunk: BufferChunk = {
      vertices: [],
      uvs: [],
      uvs2: [],
      normals: [],
      indices: [],
      offsets: [],
    }

    for (let x = minx; x < maxx; x += sizex) {
      for (let y = miny; y < maxy; y += sizey) {
        let pointx = x + (Math.random() - 0.5) * sizex * 0.5
        let pointy = y + (Math.random() - 0.5) * sizey * 0.5
        pointx = pointx < minx ? minx : pointx > maxx ? maxx : pointx
        pointy = pointy < miny ? miny : pointy > maxy ? maxy : pointy

        const chunk = this.cloneRandomChunk(
          this.meshPrototypeGenerator.prototypes
        )
        this.moveChunkToOrigin(chunk, new Vector3(pointx, 0, pointy))
        this.appendChunk(singleChunk, chunk)
      }
    }

    this.bufferGeometry = this.getBufferGeometry(singleChunk)
  }

  private cloneRandomChunk(chunks: BufferChunk[]): BufferChunk {
    return this.cloneChunk(chunks[Math.floor(Math.random() * chunks.length)])
  }

  private moveChunkToOrigin(chunk: BufferChunk, origin: Vector3): void {
    chunk.vertices.forEach((vertex) => {
      vertex[0] += origin.x
      vertex[1] += origin.y
      vertex[2] += origin.z
    })
  }

  private cloneChunk(chunk: BufferChunk): BufferChunk {
    return cloneDeep(chunk)
  }

  private appendChunk(target: BufferChunk, source: BufferChunk) {
    const startIndex = target.vertices.length
    target.vertices.push(...source.vertices)
    target.uvs.push(...source.uvs)
    target.uvs2.push(...source.uvs2)
    target.normals.push(...source.normals)
    target.indices.push(
      ...source.indices.map((layerIndices) =>
        layerIndices.map((index) => startIndex + index)
      )
    )
    target.offsets.push(...source.offsets)
  }

  public getBufferGeometry(chunk: BufferChunk) {
    const bufferGeometry = new THREE.BufferGeometry()

    bufferGeometry.setIndex(chunk.indices.flat())
    bufferGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(chunk.vertices.flat(), 3)
    )
    bufferGeometry.setAttribute(
      'uv',
      new THREE.Float32BufferAttribute(chunk.uvs.flat(), 2)
    )
    bufferGeometry.setAttribute(
      'uv2',
      new THREE.Float32BufferAttribute(chunk.uvs2.flat(), 2)
    )
    bufferGeometry.setAttribute(
      'normal',
      new THREE.Float32BufferAttribute(chunk.normals.flat(), 3)
    )
    bufferGeometry.setAttribute(
      'offsets',
      new THREE.Float32BufferAttribute(chunk.offsets, 1)
    )
    return bufferGeometry
  }
}
