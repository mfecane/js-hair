import { map } from 'src/lib/lib'
import * as THREE from 'three'
import { Vector3 } from 'three'

export type FiberPoint = {
  pos: [x: number, y: number, z: number]
  width: number
}

export type FiberCurve = FiberPoint[]

export class ExtrudedMeshGenerator2 {
  private readonly SIDE_SEGMENTS = 3
  private readonly vertices: [number, number, number][] = []
  private readonly uvs: [number, number][] = []
  private readonly uvs2: [number, number][] = []
  private readonly normals: [number, number, number][] = []
  private readonly indices: number[][] = []
  private readonly offsets: number[] = []

  public createFromCurves(curves: FiberCurve[]) {
    curves.forEach((curve) => this.addCurve(curve))
  }

  public addCurve(path: FiberCurve) {
    const angleStep = (2 * Math.PI) / this.SIDE_SEGMENTS
    const LENGTH_SEGMENTS = path.length
    const baseIndex = this.vertices.length

    const pathBase = path[0].pos

    for (let j = 0; j < LENGTH_SEGMENTS; ++j) {
      let dir1: Vector3 = new THREE.Vector3()
      let dir2: Vector3 = new THREE.Vector3()
      let dir: Vector3 = new THREE.Vector3()
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

      if (j < LENGTH_SEGMENTS - 1) {
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

      let v1 = new Vector3().crossVectors(dir, new Vector3(1, 0, 0)).normalize()
      let v2 = new Vector3().crossVectors(dir, v1).normalize()

      for (let i = 0; i < this.SIDE_SEGMENTS + 1; ++i) {
        let normal = new Vector3().addVectors(
          v1.clone().multiplyScalar(Math.cos(angleStep * i)),
          v2.clone().multiplyScalar(Math.sin(angleStep * i))
        )

        let vert = normal.clone().multiplyScalar(radius).add(point)
        this.vertices.push([vert.x, vert.y, vert.z])

        const u = map(i / this.SIDE_SEGMENTS, 0, 1, 0.01, 0.99)
        const v = map(j / (LENGTH_SEGMENTS - 1), 0, 1, 0.01, 0.99)
        this.uvs.push([u, v])


        this.uvs2.push([pathBase[0] / 6 + 0.5, pathBase[2] / 6 + 0.5])


        this.normals.push(normal.toArray())
        this.offsets.push(j / LENGTH_SEGMENTS)
      }
    }

    for (let j = 0; j < LENGTH_SEGMENTS - 1; ++j) {
      for (let i = 0; i < this.SIDE_SEGMENTS; ++i) {
        this.indices.push(
          this.getIndiciForLayer(baseIndex, i, j, this.SIDE_SEGMENTS + 1)
        )
      }
    }
  }

  private getIndiciForLayer(
    baseIndex: number,
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

    arr.push(baseIndex + a, baseIndex + b, baseIndex + c)

    // tri #2
    a = layer * numPoints + index + 1
    b = (layer + 1) * numPoints + index + 1
    c = (layer + 1) * numPoints + index

    arr.push(baseIndex + a, baseIndex + b, baseIndex + c)

    return arr
  }

  public getBufferGeometry() {
    const bufferGeometry = new THREE.BufferGeometry()

    bufferGeometry.setIndex(this.indices.flat())
    bufferGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(this.vertices.flat(), 3)
    )
    bufferGeometry.setAttribute(
      'uv',
      new THREE.Float32BufferAttribute(this.uvs.flat(), 2)
    )
    bufferGeometry.setAttribute(
      'uv2',
      new THREE.Float32BufferAttribute(this.uvs2.flat(), 2)
    )
    bufferGeometry.setAttribute(
      'normal',
      new THREE.Float32BufferAttribute(this.normals.flat(), 3)
    )
    bufferGeometry.setAttribute(
      'offsets',
      new THREE.Float32BufferAttribute(this.offsets, 1)
    )

    return bufferGeometry
  }
}
