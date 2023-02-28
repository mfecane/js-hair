import { CurvesGenerator } from 'src/carpet/CurvesGenerator'
import { Renderer } from 'src/carpet/Renderer'
import { ThreeLightsLightScheme } from 'src/carpet/ThreeLightLightSceme'
import * as THREE from 'three'
import { ExtrudedMeshGenerator2, FiberCurve } from './ExtrudedMeshGenerator2'

let renderer: Renderer

export const exec = () => {
  const div = document.createElement('div')
  div.style.width = window.innerWidth + 'px'
  div.style.height = window.innerHeight + 'px'
  document.body.appendChild(div)

  renderer = new Renderer(div)
  new ThreeLightsLightScheme(renderer)
  createObjects()

  const ah = new THREE.AxesHelper()
  renderer.scene.add(ah)

  renderer.animate()
}

const vertexShader = `
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

const fragmentShader = `
precision mediump float;
precision mediump int;

uniform sampler2D sampler;

varying vec2 vUv;
varying vec2 vUv2;
varying float vOffset;

void main()	{
    vec4 texelColor = texture2D(sampler, vUv2);
    // pseudorandomly shift uv using color
    // scaled with different factor u and v
    // adjusted to range -0.5, 0.5
    vec2 scaledUv = fract((vUv + texelColor.xy) * vec2(2.0, 6.0)) - vec2(0.5);
    float spiral = abs(abs(scaledUv.x + scaledUv.y) - 0.5);
    spiral = smoothstep(0.0, 0.5, spiral);
    texelColor *= (0.2 + vOffset * 0.8) * (0.6 + 0.4 * spiral);
    gl_FragColor = vec4(texelColor.xyz* 1.5 , 1.0);
}
`

function createObjects(): void {
  const curvesGenerator = new CurvesGenerator()
  const extrudedMeshGenerator = new ExtrudedMeshGenerator2()
  const curves = curvesGenerator.crateCurves()
  extrudedMeshGenerator.createFromCurves(curves)
  const bufferGeomertry = extrudedMeshGenerator.getBufferGeometry()
  const map = new THREE.TextureLoader().load('./texture_light.png')
  console.log('bufferGeomertry', bufferGeomertry)
  // make instances
  const material = new THREE.RawShaderMaterial({
    uniforms: {
      sampler: { value: map },
    },
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
  })

  const mesh = new THREE.Mesh(bufferGeomertry, material)
  renderer.scene.add(mesh)
}
