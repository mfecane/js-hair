import { Mesh, MeshPhongMaterial, MeshPhysicalMaterial, PlaneGeometry, TextureLoader } from 'three'
import { Renderer } from './renderer'

let renderer: Renderer

export const showCarpet = (el: HTMLElement) => {
  renderer = new Renderer(el)
  createObjects()
  renderer.animate()
}

const createObjects = () => {
  var geometry = new PlaneGeometry(0.3, 0.3, 1, 1)

  var textureLoader = new TextureLoader()
  var material = new MeshPhysicalMaterial({
    normalMap: textureLoader.load('hair-textures/hair-normal-map.png'),
    aoMap: textureLoader.load('hair-textures/hair-ao-map.png'),
    map: textureLoader.load('hair-textures/hair-alpha-map.png'),
    alphaTest: 0.9,
  })

  for (var i = 0; i < 10000; i++) {
    var mesh = new Mesh(geometry, material)

    mesh.position.set(
      Math.random() * 6 - 3,
      Math.random() * 0.1 - 0.05,
      Math.random() * 6 - 3
    )
    mesh.rotation.set(
      0,
      Math.random() * Math.PI * 2,
      0
    )

    renderer.scene.add(mesh)
  }
}
