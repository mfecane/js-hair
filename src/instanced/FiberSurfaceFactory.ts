import * as THREE from 'three'
import { Mesh } from 'three'
import { CurveGenerator } from './CurveGenerator'
import {
  ExtrudedMeshGenerator,
  ExtrudedMeshGeneratorOptions,
} from './ExtrudedMeshGenerator'

type CarpetFactoryOptions = {
  surfaceColorMap: string
  extrudedMeshGeneratorOptions: Partial<ExtrudedMeshGeneratorOptions>
}

export class FiberSurfaceFactory {
  private readonly options: CarpetFactoryOptions
  public mesh?: Mesh

  private static readonly defaults: CarpetFactoryOptions = {
    surfaceColorMap: '',
    extrudedMeshGeneratorOptions: {
      minx: -3,
      miny: -3,
      maxx: 3,
      maxy: 3,
      sizex: 0.02,
      sizey: 0.02,
    },
  }

  private static readonly vertexShader = `
precision mediump float;
precision mediump int;

uniform mat4 modelViewMatrix; // optional
uniform mat4 projectionMatrix; // optional

attribute vec3 position;
attribute vec4 color;
attribute float offsets;
attribute vec2 uv;
attribute vec2 uv2;

varying vec2 vUv;
varying vec2 vUv2;
varying float vOffset;

void main()	{
    vUv = uv;
    vUv2 = uv2;
    vOffset = offsets;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

  private static readonly fragmentShader = `
precision mediump float;
precision mediump int;

uniform sampler2D surfaceColor;

varying vec2 vUv;
varying vec2 vUv2;
varying float vOffset;

void main()	{
    vec4 texelColor = texture2D(surfaceColor, vUv2);
    // pseudorandomly shift uv using color
    // scaled with different factor u and v
    // adjusted to range -0.5, 0.5
    vec2 scaledUv = fract((vUv + texelColor.xy * 100.0) * vec2(2.0, 6.0)) - vec2(0.5);
    float spiral = abs(abs(scaledUv.x + scaledUv.y) - 0.5);
    spiral = smoothstep(0.0, 0.5, spiral);
    texelColor *= (0.2 + vOffset * 0.8) * (0.6 + 0.4 * spiral);
    gl_FragColor = vec4(texelColor.xyz* 1.5 , 1.0);
    // TODO omit something
}
`

  public constructor(options: Partial<CarpetFactoryOptions>) {
    this.options = { ...FiberSurfaceFactory.defaults, ...options }
    this.createObjects()
  }

  private createObjects(): void {
    const curveGenerator = new CurveGenerator()
    const curves = []
    for (let i = 0; i < 200; ++i) {
      curves.push(curveGenerator.generateCurve())
    }
    const extrudedMeshGenerator = new ExtrudedMeshGenerator(
      this.options.extrudedMeshGeneratorOptions
    )
    extrudedMeshGenerator.setCurves(curves)
    extrudedMeshGenerator.populateShape()
    const bufferGeomertry = extrudedMeshGenerator.bufferGeometry
    const surfaceColorMap = new THREE.TextureLoader().load(
      this.options.surfaceColorMap
    )

    const material = new THREE.RawShaderMaterial({
      uniforms: {
        surfaceColor: { value: surfaceColorMap },
      },
      vertexShader: FiberSurfaceFactory.vertexShader,
      fragmentShader: FiberSurfaceFactory.fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
    })

    this.mesh = new THREE.Mesh(bufferGeomertry, material)
  }
}
