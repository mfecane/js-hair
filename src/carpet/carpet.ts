
import * as THREE from 'three'
import { Renderer } from './Renderer'
import { ThreeLightsLightScheme } from './ThreeLightLightSceme'

let renderer: Renderer

export const showCarpet = (el: HTMLElement) => {
  renderer = new Renderer(el)
  new ThreeLightsLightScheme(renderer)
  createObjects()
  renderer.animate()
}

const NUM_LAYERS = 20

const vertexShader = `

uniform float offset;
uniform float globalTime;
uniform vec3 gravity;

varying vec2 vTexCoord;
varying vec3 vNorm;

const float spacing = 0.1;

void main()
{
    // Calculate the effect of gravity and wind on the fur.
    vec3 displacement = gravity + vec3(
        sin(globalTime+position.x*0.05)*0.4,
        cos(globalTime*0.7+position.y*0.04)*0.4,
        sin(globalTime*0.7+position.y*0.04)*0.4
    );
    //displacement = vec3(0,0,0);
    vec3 aNorm = normal;
    aNorm.xyz += displacement*pow(offset, 3.0);

    // Calculate distance from original mesh.
    vec3 point = position.xyz + (normalize(aNorm)*offset*spacing);

    vNorm = normalize(normal*aNorm);
    vTexCoord = uv;//*20.0;

    vec4 modelViewPosition = modelViewMatrix * vec4(point, 1.0);

    gl_Position = projectionMatrix * modelViewPosition;
}
`

var fragmentShader = `
uniform float offset;
uniform sampler2D hairMap;
uniform sampler2D colorMap;
uniform vec3 color;

varying vec2 vTexCoord;
varying vec3 vNorm;

void main()
{
    // Get hair properties and color from textures.
    vec4 hairProperties = texture2D(hairMap, vec2(vTexCoord.s, vTexCoord.t));
    vec4 hairColor = texture2D(colorMap, vec2(vTexCoord.s, vTexCoord.t));

    // Discard fragments that we shouldn't see.
    if (hairProperties.a <= 0.0 || hairProperties.g < offset)
    {
        discard;
    }

    float shadow = mix(0.0, hairProperties.b * 1.2, offset);
    vec3 light = vec3(0.1,1.0,0.3);
    float diffuse = pow(max(0.25, dot(vNorm.xyz, light))*2.75, 1.4);

    gl_FragColor = vec4(color * hairColor.xyz * diffuse * shadow, 1.1-offset);
}
`

function prepareTexture() {
  var canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  var context = canvas.getContext('2d')
  if (!context) {
    throw 'bruh'
  }
  for (var i = 0; i < 20000; ++i) {
    // r = hair 1/0, g = length, b = darkness
    context.fillStyle =
      'rgba(255,' +
      Math.floor(Math.random() * 255) +
      ',' +
      Math.floor(Math.random() * 255) +
      ',1)'

    context.fillRect(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      2,
      2
    )
  }
  return new THREE.CanvasTexture(canvas)
}

function createObjects() {

  var geometry = new THREE.PlaneGeometry(1, 1, 1, 1)

  const shaderTime = 0

  for (let i = 0; i < NUM_LAYERS; ++i) {
    var uniforms = {
      color: { type: 'c', value: new THREE.Color(0xffffff) },
      hairMap: { type: 't', value: prepareTexture() },
      colorMap: { type: 't', value: prepareTexture() },
      offset: { type: 'f', value: i / NUM_LAYERS  },
      globalTime: { type: 'f', value: shaderTime },
      gravity: { type: 'v3', value: new THREE.Vector3(0.25, -0.25, 0) },
    }

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    })

    const mesh = new THREE.Mesh(geometry, material)
    renderer.scene.add(mesh)
  }

  const h = new THREE.AxesHelper()
  renderer.scene.add(h)
}
