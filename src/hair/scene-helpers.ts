import * as THREE from 'three'
import { rand } from 'src/lib/random'
import { getGeoGroup, TMesh } from 'src/hair/hair-meshes'

type TCreateMeshesOptions = {
  shadow?: boolean
}

const createMeshesDefaultOptions = {
  shadow: false,
}

export const createMeshes = (
  root: THREE.Group,
  materials?: THREE.Material[],
  options?: TCreateMeshesOptions
) => {
  options = { ...createMeshesDefaultOptions, ...options }
  if (!materials) {
    materials = [new THREE.MeshBasicMaterial()]
  }
  const geoGroup = getGeoGroup()
  let index = 0
  return geoGroup.forEach((gr) => {
    const group = new THREE.Group()
    root.add(group)
    return gr.forEach((geo) => {
      index++
      materials = materials as THREE.Material[]
      const matIndex = Math.floor(materials.length * rand())
      const mesh = new THREE.Mesh(geo, materials[matIndex])

      // bull shit!
      if (options.shadow) {
        mesh.castShadow = true
        mesh.receiveShadow = true
      }

      mesh.name = `hair_${index}`
      group.add(mesh)
    })
  })
}

export const removeMeshes = (root: THREE.Group) => {
  while (true) {
    let g = root.children[0] as THREE.Group
    if (!g) {
      break
    }
    g.children.forEach((el) => {
      const mesh = el as THREE.Mesh
      // TODO ::: check
      mesh.geometry.dispose()
      mesh.material.dispose()
      g.remove(mesh)
    })
    root.remove(g)
  }
}

export const eachMesh = (
  group: THREE.Group,
  callback: (m: TMesh, groupIndex: number) => void
) => {
  group.children.forEach((el, groupIndex) => {
    const g = el as THREE.Group
    g.children.forEach((el) => {
      const m = el as TMesh
      callback(m, groupIndex)
    })
  })
}
