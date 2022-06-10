import * as THREE from 'three'
import { HairGenerator } from './hair-generator'

type TMeshes = THREE.Mesh<THREE.BufferGeometry, any>

let groups: THREE.Group[] = [
  new THREE.Group(),
  new THREE.Group(),
  new THREE.Group(),
  new THREE.Group(),
  new THREE.Group(),
]

export const getGroups = () => {
  return groups
}

const deleteHair = () => {
  groups.forEach((g) => {
    while (true) {
      let object = g.children[0] as THREE.Mesh
      if (!object) {
        break
      }
      object.geometry.dispose()
      object.material.dispose()
      g.remove(object)
      // TODO ::: check this
      // renderer.renderLists.dispose()
    }
  })
}

export const generateHair = () => {
  return new Promise((resolve) => {
    let meshes: TMeshes[] = []

    deleteHair()

    let card1 = new HairGenerator({
      rect: {
        x: 0.01,
        y: 0.99,
        w: 0.2,
        h: 1,
      },
      density: 0.4,
    })
    meshes = meshes.concat(card1.createMeshes())

    let card2 = new HairGenerator({
      rect: {
        x: 0.23,
        y: 0.99,
        w: 0.2,
        h: 1,
      },
      density: 0.3,
    })
    meshes = meshes.concat(card2.createMeshes())

    let card3 = new HairGenerator({
      rect: {
        x: 0.45,
        y: 0.99,
        w: 0.15,
        h: 1,
      },
      density: 0.2,
    })
    meshes = meshes.concat(card3.createMeshes())

    let card4 = new HairGenerator({
      rect: {
        x: 0.63,
        y: 0.99,
        w: 0.1,
        h: 1,
      },
      density: 0.1,
    })
    meshes = meshes.concat(card4.createMeshes())

    let card5 = new HairGenerator({
      rect: {
        x: 0.76,
        y: 0.99,
        w: 0.05,
        h: 1,
      },
      density: 0.05,
    })
    meshes = meshes.concat(card5.createMeshes())

    let card6 = new HairGenerator({
      rect: {
        x: 0.86,
        y: 0.99,
        w: 0.05,
        h: 1,
      },
      density: 0.02,
    })
    meshes = meshes.concat(card6.createMeshes())

    let card7 = new HairGenerator({
      rect: {
        x: 0.94,
        y: 0.99,
        w: 0.03,
        h: 1,
      },
      density: 0.01,
    })
    meshes = meshes.concat(card7.createMeshes())

    meshes.flat().forEach((m) => {
      const index = Math.floor(Math.random() * 5)
      groups[index].add(m)
    })
    resolve(null)
  })
}
