import { mapclamp } from 'src/lib/lib'
import { vector3ToTuple } from 'src/lib/three-helpers'
import { Vector3 } from 'three'
import { FiberCurve } from './ExtrudedMeshGenerator'

export class CurveGenerator {
  private readonly LENGTH = 0.3
  private readonly VARIANCE = Math.PI * 0.5
  private readonly SEGMENTS = 10.0

  constructor() {}

  public generateCurve(): FiberCurve {
    const points: FiberCurve = []
    let dir = new Vector3(0, 1, 0)
    let point = new Vector3(0, 0, 0)
    for (let i = 0; i < this.SEGMENTS; ++i) {
      points.push({
        position: vector3ToTuple(point),
        width: this.getWidth(i),
      })
      point.add(dir.clone().multiplyScalar(this.getStep(i)))
      this.changeDir(dir)
    }
    return points
  }

  private changeDir(dir: Vector3): void {
    dir.normalize()
    dir.applyAxisAngle(
      new Vector3(1, 0, 0),
      this.VARIANCE * (Math.random() - 0.5)
    )
    dir.applyAxisAngle(
      new Vector3(0, 0, 1),
      this.VARIANCE * (Math.random() - 0.5)
    )
  }

  private getWidth(index: number): number {
    const cureveParameter = index / this.SEGMENTS
    const reduce = mapclamp(cureveParameter, 0.6, 1.0, 0, 0.008)
    return 0.01 - reduce
  }

  private getStep(idnex: number): number {
    return mapclamp(
      idnex,
      0,
      this.SEGMENTS,
      this.LENGTH / this.SEGMENTS,
      this.LENGTH / this.SEGMENTS / 2
    )
  }
}
