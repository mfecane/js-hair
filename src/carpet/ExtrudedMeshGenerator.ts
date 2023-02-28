import { map } from 'src/lib/lib'
import * as THREE from 'three'
import { Vector3 } from 'three'

export type HairPoint = {
  pos: [x: number, y: number, z: number]
  width: number
}

export type HairCurve = HairPoint[]

export class ExtrudedMeshGenerator {
private readonly SEGMENTS = 4 

  public createGeo(path: HairCurve) {
    const bufferGeometry = new THREE.BufferGeometry()

    const vertices = []
    const uvs = []
    const normals = []
    const numPoints = this.SEGMENTS
    const angleStep = (2 * Math.PI) / numPoints
    const numLayers = path.length

    for (let j = 0; j < numLayers; ++j) {
      // get direction

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

      // two base v
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

    for (let j = 0; j < numLayers - 1; ++j) {
      for (let i = 0; i < numPoints; ++i) {
        indices.push(this.getIndiciForLayer(i, j, numPoints + 1))
      }
    }

    indices = indices.flat()

    bufferGeometry.setIndex(indices)
    bufferGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices.flat(), 3)
    )
    bufferGeometry.setAttribute(
      'uv',
      new THREE.Float32BufferAttribute(uvs.flat(), 2)
    )
    bufferGeometry.setAttribute(
      'normal',
      new THREE.Float32BufferAttribute(normals.flat(), 3)
    )
    return bufferGeometry
  }

  private getIndiciForLayer(
    index: number,
    layer: number,
    numPoints: number
  ): number[] {
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
}
