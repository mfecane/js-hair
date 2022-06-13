import * as THREE from 'three'
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
  return geoGroup.forEach((gr, groupIndex) => {
    const group = new THREE.Group()
    const matIndex = groupIndex % materials.length
    root.add(group)
    return gr.forEach((geo) => {
      index++
      const mat = materials[matIndex]
      // console.log('mat.color', mat.color)
      const mesh = new THREE.Mesh(geo, mat)

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
  root: THREE.Group,
  callback: (m: TMesh, groupIndex: number) => void
) => {
  root.children.forEach((el, groupIndex) => {
    const g = el as THREE.Group
    g.children.forEach((el) => {
      const m = el as TMesh
      callback(m, groupIndex)
    })
  })
}
