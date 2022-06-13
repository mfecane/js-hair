import { TMesh } from './hair-meshes'

export const eachMesh = (group: THREE.Group, callback: (m: TMesh) => void) => {
  group.children.forEach((el) => {
    const g = el as THREE.Group
    g.children.forEach((el) => {
      const m = el as TMesh
      callback(m)
    })
  })
}
