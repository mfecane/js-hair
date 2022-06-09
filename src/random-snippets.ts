// function drawDot(vec: Vector3) {
//   var dotGeometry = new THREE.BufferGeometry()
//   dotGeometry.setAttribute(
//     'position',
//     new THREE.Float32BufferAttribute([vec.x, vec.y, vec.z], 3)
//   )
//   var dotMaterial = new THREE.PointsMaterial({
//     size: 4,
//     sizeAttenuation: false,
//   })
//   var dot = new THREE.Points(dotGeometry, dotMaterial)
//   scene.add(dot)
// }

// function compareRound(a: number, b: number) {
//   return Math.abs(a - b) < 0.001
// }

// function cameraChanged(a: number, b: number) {
//   let res: boolean
//   if (
//     compareRound(lastCameraPos.x, perspCamera.position.x) &&
//     compareRound(lastCameraPos.y, perspCamera.position.y) &&
//     compareRound(lastCameraPos.z, perspCamera.position.z)
//   ) {
//     res = true
//   } else {
//     res = false
//   }

//   lastCameraPos = perspCamera.position.clone()
//   return res
// }
