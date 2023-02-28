import { map } from 'src/lib/lib'
import * as THREE from 'three'
import { Vector3 } from 'three'
import { CurveGenerator } from './CurveGenerator'
import { HairCurve } from './ExtrudedMeshGenerator'

type Options = {
  minx: number
  miny: number
  maxx: number
  maxy: number
  sizex: number
  sizey: number
}

type Point = [x: number, y: number]

export class CurvesGenerator {
  private curveGenerator: CurveGenerator
  private options: Options

  public constructor(options?: Partial<Options>) {
    this.options = {
      minx: -1,
      miny: -1,
      maxx: 1,
      maxy: 1,
      sizex: 0.05,
      sizey: 0.05,
      ...options,
    }
    this.curveGenerator = new CurveGenerator(8)
  }

  private createOrigins(): Point[] {
    const { minx, miny, maxx, maxy, sizex, sizey } = this.options
    const curves: Point[] = []
    for (let x = minx; x < maxx; x += sizex) {
      for (let y = miny; y < maxy; y += sizey) {
        let newx = x + (Math.random() - 0.5) * sizex * 0.5
        let newy = y + (Math.random() - 0.5) * sizey * 0.5
        newx = newx < minx ? minx : newx > maxx ? maxx : newx
        newy = newy < miny ? miny : newy > maxy ? maxy : newy
        curves.push([
            newx,
            newy
        ])
      }
    }
    return curves
  }

  public crateCurves(): HairCurve[] {
    return this.createOrigins().map(([x, y]: [number, number]) =>
      this.curveGenerator.generateCurve(x, y)
    )
  }
}
