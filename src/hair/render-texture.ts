import * as THREE from 'three'
import { saveAs } from 'file-saver'
import { applyMaterials, insertMeshes, TMesh } from './hair-meshes'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { eachMesh } from './scene-helpers'

let scene: THREE.Scene
let group: THREE.Group
let width: number = 4096
let height: number = 4096
let orthoCamera: THREE.OrthographicCamera
let renderer: THREE.WebGLRenderer
let composer: EffectComposer
let renderPass
let saoPass
let directionalLight: THREE.DirectionalLight
const BPP = 4

export const createScene = () => {
  scene = new THREE.Scene()
  group = new THREE.Group()

  insertMeshes(group)
  scene.add(group)

  directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(1.0, 1.0, 1.0)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  // TODO ::: make occlution by casting light from different directions
  orthoCamera = new THREE.OrthographicCamera(0, 1, 1, 0, -0.1, 0.1)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)

  renderer.setPixelRatio(window.devicePixelRatio)
}

const renderImage = () => {
  renderer.render(scene, orthoCamera)

  const gl = renderer.getContext()
  var pixels = new Uint8Array(BPP * width * height)
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

  return pixels
}

const setUpShadow = () => {
  scene.remove(directionalLight)
  directionalLight.dispose()

  directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  scene.add(directionalLight.target)
  directionalLight.target.position.set(0.5, 0.5, 0.0)
  directionalLight.castShadow = true
  directionalLight.shadow.radius = 4
  directionalLight.shadow.mapSize.width = 2048 // default
  directionalLight.shadow.mapSize.height = 2048 // default
  directionalLight.shadow.camera.near = 0.5 // default
  directionalLight.shadow.camera.far = 2 // default
  const shadowSize = 0.6
  directionalLight.shadow.camera.top = shadowSize
  directionalLight.shadow.camera.right = shadowSize
  directionalLight.shadow.camera.bottom = -shadowSize
  directionalLight.shadow.camera.left = -shadowSize
  scene.add(directionalLight)

  const light = new THREE.AmbientLight(0xffffff, 0.3) // soft white light
  scene.add(light)

  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  eachMesh(group, (m) => {
    m.castShadow = true
    m.receiveShadow = true
  })
}

const addDilation = (pixels: Uint8Array) => {
  const dilate = 8

  const applyAlpha = (i: number) => {
    const alpha = pixels[i * BPP + 3] / 255
    // pixels[i * BPP + 0] = 255 * (1 - alpha) + pixels[i * BPP + 0] * alpha
    // pixels[i * BPP + 1] = 255 * (1 - alpha) + pixels[i * BPP + 1] * alpha
    // pixels[i * BPP + 2] = 255 * (1 - alpha) + pixels[i * BPP + 2] * alpha

    // if (pixels[i * BPP + 0] < 20) {
    //   debugger
    // }

    pixels[i * BPP + 0] = pixels[i * BPP + 0] / alpha
    pixels[i * BPP + 1] = pixels[i * BPP + 1] / alpha
    pixels[i * BPP + 2] = pixels[i * BPP + 2] / alpha
    pixels[i * BPP + 3] = 255
  }

  const dilateFn = (from: number, to: number) => {
    // if (false) {
    const next = [pixels[to * BPP], pixels[to * BPP + 1], pixels[to * BPP + 2]]

    const prev = [
      pixels[from * BPP],
      pixels[from * BPP + 1],
      pixels[from * BPP + 2],
    ]

    const dist = to - from
    let dilateNum
    if (dist > 2 * dilate) {
      dilateNum = dilate
    } else {
      dilateNum = Math.floor(dist / 2) + 1
    }

    for (let k = 1; k < dilateNum; ++k) {
      let idx2 = to - k
      // draw dilation map
      // pixels[idx2 * BPP] = 255
      // pixels[idx2 * BPP + 1] = 0
      // pixels[idx2 * BPP + 2] = 0
      // pixels[idx2 * BPP + 3] = 255

      pixels[idx2 * BPP] = next[0]
      pixels[idx2 * BPP + 1] = next[1]
      pixels[idx2 * BPP + 2] = next[2]
      pixels[idx2 * BPP + 3] = 255
    }

    for (let k = 1; k < dilateNum; ++k) {
      let idx2 = from + k
      // draw dilation map
      // pixels[idx2 * BPP] = 0
      // pixels[idx2 * BPP + 1] = 255
      // pixels[idx2 * BPP + 2] = 0
      // pixels[idx2 * BPP + 3] = 255

      pixels[idx2 * BPP] = prev[0]
      pixels[idx2 * BPP + 1] = prev[1]
      pixels[idx2 * BPP + 2] = prev[2]
      pixels[idx2 * BPP + 3] = 255
    }
  }

  for (let j = 0; j < height; ++j) {
    let last = 0
    let zeros = 0
    console.log(`dilation row ${j} of ${height}`)

    for (let i = 0; i < width; ++i) {
      const idx = j * width + i // index in pixels
      // TODO ::: handle dilate last col in row

      if (pixels[idx * BPP + 3] !== 0) {
        applyAlpha(idx)

        // dilate in middle
        if (zeros > 0) {
          dilateFn(last, idx)
        }

        // dilate first, not needed
        // if (last === 0) {
        //   dilateFn(0, idx)
        // }

        zeros = 0
        last = idx
      } else {
        zeros++
      }
    }

    // dilate last
    if (last !== 0) {
      dilateFn(last, j * width + width - 1)
    }
  }
  return pixels
}

export const renderAoTexture = () => {
  return new Promise((resolve) => {
    updateMaterials([new THREE.MeshStandardMaterial({ color: 0xffffff })])

    setUpShadow()

    const imgPixels: Uint8Array[] = []

    let passes = 9
    for (let a = 30; a <= 150; a += 120 / passes) {
      const angle = (a / 180) * Math.PI
      directionalLight.position.set(0.5 + Math.cos(angle), 0.5, Math.sin(angle))
      const imgData = renderImage()
      imgPixels.push(imgData)
    }

    var newPixels = new Uint8Array(BPP * width * height)

    for (let j = 0; j < height; ++j) {
      console.log(`generating ao row ${j} of ${height}`)
      for (let i = 0; i < width; ++i) {
        const idx = j * width * BPP + i * BPP
        let p = 0
        for (let l = 0; l < passes; ++l) {
          p += imgPixels[l][idx] / passes
        }
        newPixels[idx + 0] = p // only one channel
        newPixels[idx + 1] = p
        newPixels[idx + 2] = p
        newPixels[idx + 3] = imgPixels[0][idx + 3]
      }
    }

    newPixels = addDilation(newPixels)

    var imageData = new ImageData(
      new Uint8ClampedArray(newPixels),
      width,
      height
    )

    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to retrieve canvas context')
    }
    canvas.width = imageData.width
    canvas.height = imageData.height
    ctx.putImageData(imageData, 0, 0)

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve) // implied image/png format
    }).then((blob) => {
      if (blob) {
        saveAs(blob, 'texture.png')
      }
      resolve(null)
      scene.clear()
    })
  })
}

export const renderTexture = () => {
  return renderTexturePlain()
}

export const renderTexturePlain = () => {
  renderer.render(scene, orthoCamera)

  const gl = renderer.getContext()
  var pixels = new Uint8Array(4 * width * height)
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  var imageData = new ImageData(new Uint8ClampedArray(pixels), width, height)

  var canvas = document.createElement('canvas')
  var ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to retrieve canvas context')
  }
  canvas.width = imageData.width
  canvas.height = imageData.height
  ctx.putImageData(imageData, 0, 0)

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve) // implied image/png format
  }).then((blob) => {
    if (blob) {
      saveAs(blob, 'texture.png')
    }
    scene.clear()
  })
}

export const renderTextureComp = () => {
  const bufferTexture = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.NearestFilter,
  })

  // renderer.setRenderTarget(bufferTexture)
  composer = new EffectComposer(renderer, bufferTexture)
  composer.setSize(width, height)
  renderPass = new RenderPass(scene, orthoCamera)
  composer.addPass(renderPass)
  // saoPass = new SAOPass(scene, orthoCamera, false, true)
  // composer.addPass(saoPass)
  composer.render()

  // composer.writeBuffer.texture

  const scene2 = new THREE.Scene()
  const geometry = new THREE.PlaneGeometry(1, 1)
  const material = new THREE.MeshBasicMaterial({
    color: 0x666666,
    side: THREE.DoubleSide,
    map: bufferTexture.texture,
    // map: composer.writeBuffer.texture,
  })
  const plane = new THREE.Mesh(geometry, material)
  plane.name = 'Plane'
  plane.position.set(0.5, 0.5, 0.0)
  scene2.add(plane)

  const renderer2 = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  const camera2 = new THREE.OrthographicCamera(0, 1, 1, 0, -0.1, 0.1)
  renderer2.setPixelRatio(window.devicePixelRatio)
  renderer2.setSize(width, height)
  renderer2.render(scene2, camera2)

  // const rendercomposer.writeBuffer()

  // let texture = bufferTexture.texture
  // debugger

  var gl = renderer2.getContext()
  // var gl = composer.renderer.getContext()
  var pixels = new Uint8Array(4 * width * height)

  // composer.renderer.readRenderTargetPixels(
  //   bufferTexture,
  //   0,
  //   0,
  //   width,
  //   height,
  //   pixels
  // )
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  var imageData = new ImageData(new Uint8ClampedArray(pixels), width, height)

  var canvas = document.createElement('canvas')
  var ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to retrieve canvas context')
  }
  canvas.width = imageData.width
  canvas.height = imageData.height
  ctx.putImageData(imageData, 0, 0)

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve) // implied image/png format
  }).then((blob) => {
    if (blob) {
      saveAs(blob, 'texture.png')
    }
  })
}

const updateMaterials = (materials: THREE.Material[]) => {
  eachMesh(group, (mesh, groupIndex) => {
    const matIndex = groupIndex % materials.length
    mesh.material = materials[matIndex]
  })
}
