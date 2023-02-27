import { BufferGeometry, Float32BufferAttribute } from 'three'

export class CardGeometry extends BufferGeometry {
  parameters: any

  constructor(
    width: number = 1,
    height: number = 1,
    widthSegments: number = 1,
    heightSegments: number = 1
  ) {
    super()

    this.type = 'CardGeometry'

    this.parameters = {
      width: width,
      height: height,
      widthSegments: widthSegments,
      heightSegments: heightSegments,
    }

    const width_half = width / 2
    const height_half = height / 2

    const gridX = Math.floor(widthSegments)
    const gridY = Math.floor(heightSegments)

    const gridX1 = gridX + 1
    const gridY1 = gridY + 1

    const segment_width = width / gridX
    const segment_height = height / gridY

    const indices = []
    const vertices = []
    const normals = []
    const uvs = []

    for (let iy = 0; iy < gridY1; iy++) {
      const y = iy * segment_height - height_half

      for (let ix = 0; ix < gridX1; ix++) {
        const x = ix * segment_width - width_half

        const yshift = -0.2 * y * y / height_half / height_half - 0.2
        vertices.push(x, -y, yshift * 0.4)

        normals.push(0, 0, 1)

        uvs.push(ix / gridX)
        uvs.push(1 - iy / gridY)
      }
    }

    for (let iy = 0; iy < gridY; iy++) {
      for (let ix = 0; ix < gridX; ix++) {
        const a = ix + gridX1 * iy
        const b = ix + gridX1 * (iy + 1)
        const c = ix + 1 + gridX1 * (iy + 1)
        const d = ix + 1 + gridX1 * iy

        indices.push(a, b, d)
        indices.push(b, c, d)
      }
    }

    this.setIndex(indices)
    this.setAttribute('position', new Float32BufferAttribute(vertices, 3))
    this.setAttribute('normal', new Float32BufferAttribute(normals, 3))
    this.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  }

  copy(source: CardGeometry) {
    super.copy(source)
    this.parameters = Object.assign({}, source.parameters)
    return this
  }

  static fromJSON(data: {
    width: number
    height: number
    widthSegments: number
    heightSegments: number
  }) {
    return new CardGeometry(
      data.width,
      data.height,
      data.widthSegments,
      data.heightSegments
    )
  }
}

export { CardGeometry as PlaneGeometry }
