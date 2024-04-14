import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three'
import { HairPath } from './hair-generator'
import { map } from 'src/lib/lib'

export function createGeo(path: HairPath): BufferGeometry {
	const geo = new BufferGeometry()

	const vertices = []
	const uvs = []
	const normals = []
	const numPoints = 8
	const angleStep = (2 * Math.PI) / numPoints
	const numLayers = path.points.length

	for (let j = 0; j < numLayers; ++j) {
		// get direction

		let dir1, dir2, dir
		let point = new Vector3(path.points[j].pos[0], path.points[j].pos[1], path.points[j].pos[2])
		let radius = path.points[j].width

		if (j > 0) {
			let prev = new Vector3(path.points[j - 1].pos[0], path.points[j - 1].pos[1], path.points[j - 1].pos[2])
			dir1 = new Vector3().subVectors(point, prev)
		}

		if (j < numLayers - 1) {
			let next = new Vector3(path.points[j + 1].pos[0], path.points[j + 1].pos[1], path.points[j + 1].pos[2])
			dir2 = new Vector3().subVectors(next, point)
		}

		dir = dir1 || dir2
		if (dir1 && dir2) {
			dir = new Vector3().addVectors(dir1, dir2)
		}

		// const arrowHelper = new THREE.ArrowHelper(
		//   dir?.normalize(),
		//   new Vector3(0, 0, 1).add(point),
		//   0.4
		// )
		// scene.add(arrowHelper)

		// two base vectors

		//@ts-expect-error fuck off
		let v1 = new Vector3().crossVectors(dir, new Vector3(1, 0, 0)).normalize()

		//@ts-expect-error fuck off
		let v2 = new Vector3().crossVectors(dir, v1).normalize()

		// TODO ::: optimize
		// TODO ::: cache dirs, optimize

		// diplicate seam vertices
		for (let i = 0; i < numPoints + 1; ++i) {
			let normal = new Vector3().addVectors(
				v1.clone().multiplyScalar(Math.cos(angleStep * i)),
				v2.clone().multiplyScalar(Math.sin(angleStep * i))
			)

			let vert = normal.clone().multiplyScalar(radius).add(point)
			vertices.push([vert.x, vert.y, vert.z])

			const u = map(i / numPoints, 0, 1, 0.01, 0.99)
			const v = map(j / (numLayers - 1), 0, 1, 0.01, 0.99)
			uvs.push([u, v])

			normals.push(normal.toArray())
		}
	}

	let indices = []

	const getIndiciForLayer = (index: number, layer: number, numPoints: number) => {
		const arr = []
		let a, b, c

		// tri #1
		a = layer * numPoints + index
		b = layer * numPoints + index + 1
		c = (layer + 1) * numPoints + index

		arr.push(a, b, c)

		// tri #2
		a = layer * numPoints + index + 1
		b = (layer + 1) * numPoints + index + 1
		c = (layer + 1) * numPoints + index

		arr.push(a, b, c)

		return arr
	}

	for (let j = 0; j < numLayers - 1; ++j) {
		for (let i = 0; i < numPoints; ++i) {
			indices.push(getIndiciForLayer(i, j, numPoints + 1))
		}
	}

	indices = indices.flat()

	geo.setIndex(indices)
	geo.setAttribute('position', new Float32BufferAttribute(vertices.flat(), 3))
	geo.setAttribute('uv', new Float32BufferAttribute(uvs.flat(), 2))
	geo.setAttribute('normal', new Float32BufferAttribute(normals.flat(), 3))
	return geo
}
