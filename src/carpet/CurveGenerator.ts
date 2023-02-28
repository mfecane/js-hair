import { mapclamp } from 'src/lib/lib'
import { vector3ToTuple } from 'src/lib/three-helpers'
import { Vector3 } from 'three'
import { HairCurve } from './ExtrudedMeshGenerator'

export class CurveGenerator {
  private readonly LENGTH = 0.3

  constructor(private readonly segments: number) {}

  public generateCurve(x: number, z: number): HairCurve {
    const points: HairCurve = []
    let dir = new Vector3(0, 1, 0)
    let point = new Vector3(x, 0, z)
    for (let i = 0; i < this.segments; ++i) {
      points.push({
        pos: vector3ToTuple(point),
        width: this.getWidth(i),
      })
      point.add(dir.clone().multiplyScalar(this.getStep(i)))
      this.changeDir(dir)
    }
    return points
  }

  private changeDir(dir: Vector3): Vector3 {
    const dirChange = new Vector3(Math.random() - 0.5, 0, Math.random() - 0.5)
    return dir.add(dirChange).normalize()
  }

  private getWidth(index: number): number {
    const cureveParameter = index / this.segments
    const reduce = mapclamp(cureveParameter, 0.6, 1.0, 0, 0.015)
    return 0.02 - reduce
  }

  private getStep(idnex: number): number {
    return mapclamp(
      idnex,
      0,
      this.segments,
      this.LENGTH / this.segments,
      this.LENGTH / this.segments / 2
    )
  }
}
