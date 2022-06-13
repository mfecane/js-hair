import * as THREE from 'three'
import { HairGenerator } from './hair-generator'
import { getRand, resetRand } from '../lib/random'

// TODO ::: deduplicate materials

export type TMesh = THREE.Mesh<THREE.BufferGeometry, any>

let groups: THREE.Group[] = [
  new THREE.Group(),
  new THREE.Group(),
  new THREE.Group(),
  new THREE.Group(),
  new THREE.Group(),
]

const defaultMat = new THREE.MeshLambertMaterial()

export const applyMaterials = (materials?: THREE.Material[]) => {
  const groupsCopy = groups.map((g) => g.clone())
  if (materials && materials.length) {
    groupsCopy.forEach((g, index) => {
      const matIndex = index % materials.length
      const mat = materials[matIndex]
      g.children.forEach((mesh: TMesh) => {
        mesh.material = mat
      })
    })
  }
  return groupsCopy
}

export const insertMeshes = (group: THREE.Group) => {
  groups.forEach((g) => {
    const newGroup = g.clone()
    group.add(newGroup)
  })
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
    let geos: THREE.BufferGeometry[] = []

    resetRand()
    deleteHair()

    let card1 = new HairGenerator({
      rect: {
        x: 0.01,
        y: 0.99,
        w: 0.2,
        h: 1,
      },
      clampCount: 12,
      density: 0.4,
    })
    geos = geos.concat(card1.getGeo())

    let card2 = new HairGenerator({
      rect: {
        x: 0.23,
        y: 0.99,
        w: 0.2,
        h: 1,
      },
      density: 0.3,
    })
    geos = geos.concat(card2.getGeo())

    let card3 = new HairGenerator({
      rect: {
        x: 0.45,
        y: 0.99,
        w: 0.15,
        h: 1,
      },
      density: 0.2,
    })
    geos = geos.concat(card3.getGeo())

    let card4 = new HairGenerator({
      rect: {
        x: 0.63,
        y: 0.99,
        w: 0.1,
        h: 1,
      },
      density: 0.1,
    })
    geos = geos.concat(card4.getGeo())

    let card5 = new HairGenerator({
      rect: {
        x: 0.76,
        y: 0.99,
        w: 0.05,
        h: 1,
      },
      density: 0.05,
    })
    geos = geos.concat(card5.getGeo())

    let card6 = new HairGenerator({
      rect: {
        x: 0.86,
        y: 0.99,
        w: 0.05,
        h: 1,
      },
      density: 0.02,
    })
    geos = geos.concat(card6.getGeo())

    let card7 = new HairGenerator({
      rect: {
        x: 0.94,
        y: 0.99,
        w: 0.03,
        h: 1,
      },
      density: 0.01,
    })
    geos = geos.concat(card7.getGeo())

    geos.flat().forEach((geo, index) => {
      const mesh = new THREE.Mesh(geo, defaultMat)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.name = `hair_${index}`
      const groupIdx = Math.floor(getRand() * groups.length)
      groups[groupIdx].add(mesh)
    })

    resolve(null)
  })
}
