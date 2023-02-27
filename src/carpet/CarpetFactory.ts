import { PlaneGeometry } from 'three'

export class CarpetFactory {
  public constructor() {}

  createGeometry() {
    var geometry = new PlaneGeometry(0.3, 0.3, 4, 4)
    console.log('geometry', geometry)
  }
}
