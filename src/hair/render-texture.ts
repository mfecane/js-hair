import * as THREE from 'three'
import { saveAs } from 'file-saver'
import { createMeshes } from './scene-helpers'
import JSZip from 'jszip'

let scene: THREE.Scene
let group: THREE.Group
let width: number = 1024
let height: number = 1024
let orthoCamera: THREE.OrthographicCamera
let renderer: THREE.WebGLRenderer
let directionalLight: THREE.DirectionalLight
const BPP = 4

//seed

export const createScene = () => {
  scene = new THREE.Scene()
  group = new THREE.Group()
  scene.add(group)
  orthoCamera = new THREE.OrthographicCamera(0, 1, 1, 0, -0.15, 0.01) // why the fuck!!!
  // this is fucking stupid
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(1.0)
}

const clearScene = () => {
  group.clear()
  renderer.dispose()
  if (!scene) return
  scene.clear()
}

export const createMaps = async () => {
  const archive = new JSZip()

  const normalMap = await createNormalMap()
  archive.file('hair-normal-map.png', normalMap)

  const heightMap = await createHeightMap()
  archive.file('hair-height-map.png', heightMap)

  const idMap = await createIdMap()
  archive.file('hair-id-map.png', idMap)

  const alphaMap = await createAlphaMap()
  archive.file('hair-alpha-map.png', alphaMap)

  const aoMap = await createAoMap()
  archive.file('hair-ao-map.png', aoMap)

  let content = await archive.generateAsync({ type: 'blob' })
  saveAs(content, 'hair-textures.zip')
}

export const createAlphaMap = () => {
  return new Promise<Blob>((resolve) => {
    createScene()
    createMeshes(group, [new THREE.MeshBasicMaterial({ color: 0xffffff })])

    renderer.setClearColor(0x000000)
    renderer.render(scene, orthoCamera)
    clearScene()

    const gl = renderer.getContext()
    var pixels = new Uint8Array(4 * width * height)
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

    createImage(pixels).then(function (blob) {
      resolve(blob)
    })
  })
}

export const createIdMap = () => {
  return new Promise<Blob>((resolve) => {
    createScene()

    const materials = [
      new THREE.MeshBasicMaterial({ color: 0x333333 }),
      new THREE.MeshBasicMaterial({ color: 0x666666 }),
      new THREE.MeshBasicMaterial({ color: 0x999999 }),
      new THREE.MeshBasicMaterial({ color: 0xcccccc }),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    ]
    // const materials = [
    //   new MeshBasicMaterial({ color: 0xff0000 }),
    //   new MeshBasicMaterial({ color: 0x00ff00 }),
    //   new MeshBasicMaterial({ color: 0x0000ff }),
    //   new MeshBasicMaterial({ color: 0xffff00 }),
    //   new MeshBasicMaterial({ color: 0x00ffff }),
    // ]
    createMeshes(group, materials)

    renderer.render(scene, orthoCamera)
    clearScene()

    const gl = renderer.getContext()
    var pixels = new Uint8Array(4 * width * height)
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

    pixels = addDilation(pixels)

    createImage(pixels).then(function (blob) {
      resolve(blob)
    })
  })
}

export const createNormalMap = () => {
  return new Promise<Blob>((resolve) => {
    createScene()

    const materials = [new THREE.MeshNormalMaterial()]
    createMeshes(group, materials)

    renderer.render(scene, orthoCamera)
    clearScene()

    const gl = renderer.getContext()
    var pixels = new Uint8Array(4 * width * height)
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

    pixels = addDilation(pixels)

    createImage(pixels).then(function (blob) {
      resolve(blob)
    })
  })
}

export const createHeightMap = () => {
  return new Promise<Blob>((resolve) => {
    createScene()

    const materials = [new THREE.MeshDepthMaterial()]
    createMeshes(group, materials)

    renderer.render(scene, orthoCamera)
    clearScene()

    const gl = renderer.getContext()
    var pixels = new Uint8Array(4 * width * height)
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

    pixels = addDilation(pixels)

    createImage(pixels).then(function (blob) {
      resolve(blob)
    })
  })
}

export const createAoMap = () => {
  const renderPass = () => {
    renderer.render(scene, orthoCamera)

    const gl = renderer.getContext()
    var pixels = new Uint8Array(BPP * width * height)
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

    return pixels
  }

  return new Promise<Blob>((resolve) => {
    scene = new THREE.Scene()
    group = new THREE.Group()
    scene.add(group)

    orthoCamera = new THREE.OrthographicCamera(0, 1, 1, 0, -0.1, 0.1)

    directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    scene.add(directionalLight.target)
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
    directionalLight.target.position.set(0.5, 0.5, 0.0)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    const materials = [new THREE.MeshStandardMaterial({ color: 0xffffff })]
    createMeshes(group, materials, { shadow: true })

    const imgPixels: Uint8Array[] = []

    let passes = 9
    const minAngle = 30
    const maxAngle = 150
    for (let a = minAngle; a <= maxAngle; a += (maxAngle - minAngle) / passes) {
      const angle = (a / 180) * Math.PI
      directionalLight.position.set(0.5 + Math.cos(angle), 0.5, Math.sin(angle))
      const imgData = renderPass() // dont render
      imgPixels.push(imgData)
    }
    clearScene()

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

    createImage(newPixels).then(function (blob) {
      resolve(blob)
    })
  })
}

const createImage = async (pixels: Uint8Array) => {
  var imageData = new ImageData(new Uint8ClampedArray(pixels), width, height)

  var canvas = document.createElement('canvas')
  var ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to retrieve canvas context')
  }
  canvas.width = width
  canvas.height = height
  ctx.putImageData(imageData, 0, 0)
  document.body.appendChild(canvas)
  return await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error('Failed to create blob')
      resolve(blob)
    }) // implied image/png format
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
