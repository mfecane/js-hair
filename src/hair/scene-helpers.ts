import { TMesh } from './hair-meshes'

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

export const cleanScene = (group: THREE.Group) => {
  while (true) {
    let g = group.children[0] as THREE.Group
    if (!g) {
      break
    }
    g.children.forEach((el) => {
      const mesh = el as THREE.Mesh
      mesh.geometry.dispose()
      mesh.material.dispose()
      g.remove(mesh)
    })
    group.remove(g)
  }
}
