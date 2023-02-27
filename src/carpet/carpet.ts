import {
  AxesHelper,
  Euler,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  PlaneGeometry,
  Quaternion,
  Shader,
  TextureLoader,
  Vector3,
} from 'three'
import { CardGeometry } from './CardGeometry'
import { CarpetFactory } from './CarpetFactory'
import { Renderer } from './Renderer'
import { ThreeLightsLightScheme } from './ThreeLightLightSceme'

let renderer: Renderer

export const showCarpet = (el: HTMLElement) => {
  renderer = new Renderer(el)
  new ThreeLightsLightScheme(renderer)
  createObjects()
  renderer.animate()
}

var vertexShader = `
#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
    varying vec3 vWorldPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {
    #include <uv_vertex>
    #include <uv2_vertex>
    #include <color_vertex>
    #include <morphcolor_vertex>
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>
    #include <normal_vertex>
    #include <begin_vertex>
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <displacementmap_vertex>
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>

    float amplitude = 0.1;
    float frequency = 3.0;
    gl_Position.x += sin(transformed.y * frequency) * amplitude;
    gl_Position.z += cos(transformed.y * frequency) * amplitude;

    vViewPosition = - mvPosition.xyz;
    #include <worldpos_vertex>
    #include <shadowmap_vertex>
    #include <fog_vertex>
    #ifdef USE_TRANSMISSION
        vWorldPosition = worldPosition.xyz;
    #endif
}`

const createObjects = () => {
  var textureLoader = new TextureLoader()
  var material = new MeshPhysicalMaterial({
    color: 0xFFBBAA,
    normalMap: textureLoader.load('hair-textures/hair-normal-map.png'),
    aoMap: textureLoader.load('hair-textures/hair-ao-map.png'),
    alphaMap: textureLoader.load('hair-textures/hair-alpha-map.png'),
    alphaTest: 0.9,
    wireframe: true,
  })

  // material.onBeforeCompile = function (shader: Shader) {
  //   // shader.vertexShader = vertexShader;
  //   shader.uniforms.time = { value: 0 }
  // }

  const NUM_FIBERS = 20000

  var geometry = new CardGeometry(0.2, 0.2, 1, 4)
  const mesh = new InstancedMesh(geometry, material, NUM_FIBERS)

  const matrix = new Matrix4()
  for (var i = 0; i < NUM_FIBERS; i++) {
    randomizeMatrix(matrix)
    mesh.setMatrixAt(i, matrix)
  }

  const h = new AxesHelper()
  renderer.scene.add(h)
  renderer.scene.add(mesh)

  addFloor()
}

function addFloor() {
  var geometry = new PlaneGeometry(4, 4);
  var material = new MeshBasicMaterial({ color: 0x80584e });
  var plane = new Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.1;
  renderer.scene.add(plane);
}


const randomizeMatrix = (function () {
  const position = new Vector3()
  const rotation = new Euler()
  const quaternion = new Quaternion()
  const scale = new Vector3()

  return function (matrix: Matrix4) {
    position.x = Math.random() * 4 - 2
    position.y = 0
    position.z = Math.random() * 4 - 2

    // rotation.x = Math.random()
    rotation.y = Math.random() * Math.PI * 2
    // rotation.z = Math.random()

    quaternion.setFromEuler(rotation)

    scale.x = scale.y = scale.z = 1

    matrix.compose(position, quaternion, scale)
  }
})()
