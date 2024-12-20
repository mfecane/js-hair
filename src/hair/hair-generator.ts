import { nn, smoothstep } from '../lib/lib'
import { rand } from 'src/lib/random'
import { IWeightProvider, Ramp1, WidthProfile } from './ramps'
import { createGeo } from './create-geo'
import { BufferGeometry } from 'three'
import { makeClumps } from './modifiers/clumping'

// TODO ::: add createSpline

type Vector3Tuple = [x: number, y: number, z: number]

type Vector2Tuple = [x: number, y: number]

type HairPoint = {
	pos: Vector3Tuple
	// col: [number, number, number] // TODO what
	width: number
}

export class HairPath {
	public points: HairPoint[] = []
	public clumpId: number = 0
	public origin: Vector3Tuple = [0, 0, 0]
	public uv: Vector2Tuple = [0, 0]
}

type THairPath = HairPoint[]

export type TGeo = BufferGeometry

type Rect = {
	x: number
	y: number
	w: number
	h: number
}

interface HairGeneratorOptions {
	rect: Rect
	density?: number
	clampCount?: number
	width?: number
	stray?: number
	variance?: number
}

const MAX_ORIGINS = 1500

function createOrigins(rect: Rect, density: number): HairPath[] {
	const originShift = 0.02
	const vSteps = 5

	const result = []

	for (let i = 0; i < MAX_ORIGINS; i += vSteps) {
		for (let j = 0; j < vSteps; ++j) {
			if (rand() > density) {
				continue
			}

			const u = i / MAX_ORIGINS
			const v = j / vSteps

			const x = rect.x + rect.w * u
			const y = rect.y - originShift * v

			const path = new HairPath()
			path.origin = [x, y, 0]
			path.uv = [u, v]
			result.push(path)
		}
	}

	return result
}

function addClumps(paths: HairPath[], clumpCount: number): void {
	for (let i = 0; i < paths.length; ++i) {
		paths[i].clumpId = Math.floor((i / paths.length) * clumpCount)
	}
}

/**
 * Assuming clumped path are sorted together
 * FAIL
 */
// function clumpPaths(paths: HairPath[], weight: IWeightProvider) {
// 	// sort by clampId

// 	type ClumpData = { start: number; end: number }

// 	function getClumpData(): ClumpData[] {
// 		let clumpData: ClumpData[] = []
// 		let lastClump = -1
// 		for (let j = 0; j < paths.length; ++j) {
// 			if (paths[j].clumpId != lastClump) {
// 				console.log('lastClump', lastClump)
// 				if (clumpData.length) {
// 					clumpData[clumpData.length - 1].end = j - 1
// 				}
// 				clumpData.push({ start: j, end: 0 })
// 				lastClump = paths[j].clumpId
// 			}
// 		}
// 		clumpData[clumpData.length - 1].end = paths.length - 1
// 		return clumpData
// 	}

// 	// function g(clumpId: number): [number, ClumpData] {
// 	// 	let clumpData2 = clumpData[clumpId]
// 	// 	if (j > clumpData2.end) {
// 	// 		clumpId ++
// 	// 		clumpData2 = clumpData[clumpId]
// 	// 	}
// 	// 	return [clumpId, clumpData2]
// 	// }

// 	const clumpData = getClumpData()
// 	const segments = paths[0].points.length
// 	for (let i = 0; i < segments; ++i) {

// 		// get average
// 		const avg: Vector3Tuple[] = []
// 		let clumpId = 0
// 		for (let j = 0; j < paths.length; ++j) {

// 			// get clampid
// 			let clumpData2 = clumpData[clumpId]
// 			if (j > clumpData2.end) {
// 				clumpId ++
// 				clumpData2 = clumpData[clumpId]
// 			}

// 			let clumpCount = clumpData2.end - clumpData2.start

// 			if (!avg[clumpId]) {
// 				avg[clumpId] = [0, 0, 0]
// 			}
// 			avg[clumpId][0] += paths[j].points[i].pos[0] / clumpCount
// 			avg[clumpId][1] += paths[j].points[i].pos[1] / clumpCount
// 			avg[clumpId][2] += paths[j].points[i].pos[2] / clumpCount
// 		}

// 		// morph to average
// 		const w = weight.get(i / segments)
// 		for (let j = 0; j < paths.length; ++j) {

// 			// get clampid
// 			let clumpData2 = clumpData[clumpId]
// 			if (j > clumpData2.end) {
// 				clumpId ++
// 				clumpData2 = clumpData[clumpId]
// 			}

// 			paths[j].points[i].pos[0] = (1 - w) * paths[j].points[i].pos[0] + w * avg[clumpId][0]
// 			paths[j].points[i].pos[2] = (1 - w) * paths[j].points[i].pos[2] + w * avg[clumpId][2]
// 		}
// 	}
// }

function shuffleClumps(paths: HairPath[], clumpCount: number, stray: number): void {
	for (let i = 0; i < paths.length; ++i) {
		let clumpId = paths[i].clumpId
		const seed = rand()
		const shuffle = 0.5
		if (seed < 0.2 * shuffle) {
			// move to previous clump
			clumpId = clumpId > 0 ? clumpId - 1 : clumpId
		} else if (seed < 0.4 * shuffle) {
			// move to next clump
			clumpId = clumpId < clumpCount - 1 ? clumpId + 1 : clumpId
		} else if (seed < 0.4 * shuffle + 0.4 * stray) {
			// stray
			clumpId = 0
		}
		paths[i].clumpId = clumpId
	}
}

function morphPathTo(source: HairPath, target: HairPath, weight: IWeightProvider) {
	if (source.points.length != target.points.length) {
		throw `Morph path failed: paths vertex counts are not the same source(${source.points.length}), target(${target.points.length})`
	}

	for (let i = 0; i < target.points.length; i++) {
		const t = i / target.points.length
		const k = weight.get(t)
		source.points[i].pos[0] = source.points[i].pos[0] + (target.points[i].pos[0] - source.points[i].pos[0]) * k
		// ignore y in this case
		// p1[i].pos[1] = p1[i].pos[1] + (p2[i].pos[1] - p1[i].pos[1]) * k
		source.points[i].pos[2] = source.points[i].pos[2] + (target.points[i].pos[2] - source.points[i].pos[2]) * k
	}
}

export class HairGenerator {
	// flatten here?
	paths: HairPath[] = []
	geos: BufferGeometry[] = []
	rect: Rect
	MAX_ORIGINS = 1500
	variance = 0.01
	SEGMENTS = 80
	ELEVATION = 0.07
	width = 0.0003
	density = 0.5
	clampCount = 5
	stray = 0.1

	constructor(options: HairGeneratorOptions) {
		this.rect = options.rect

		this.density = options.density || this.density
		this.clampCount = options.clampCount || this.clampCount
		this.width = options.width || this.width
		this.stray = options.stray || this.stray
		this.variance = options.variance || this.variance

		this.createClamps()
		this.createMeshes()
	}

	createClamps() {
		const paths = createOrigins(this.rect, this.density)
		addClumps(paths, this.clampCount)
		shuffleClumps(paths, this.clampCount, this.stray)

		const obj = Object.groupBy(paths, (el: HairPath) => String(el.clumpId))

		// bullshit
		this.paths = Object.keys(obj)
			.map((key) => {
				let origPoints = nn(obj[key]).map((el: HairPath) => el.origin)
				if (key === 'null') {
					return this.createStray(origPoints, 0)
				}
				return this.createClamp(origPoints, Number(key))
			})
			.filter((cl) => !!cl) // ?
			.flat()

		makeClumps(this.paths, 5)

		// clumpPaths(this.paths, new Ramp1(0.1, 0.9, 0.6, 1.0))
	}

	createClamp(origins: [number, number, number][], clumpId: number): HairPath[] {
		const avgX =
			origins.reduce((acc, cur) => {
				return acc + cur[0]
			}, 0) / origins.length
		const avgZ = this.ELEVATION / 2

		const clumpOrigin: [number, number, number] = [avgX, this.rect.y, avgZ]
		const clumpPath = this.createPath(clumpOrigin, clumpId)

		// we want clamps lower lowering clamp control path
		this.lowerPath(clumpPath.points, 0.5)

		// base generator
		const paths = origins.map((o) => this.createPath(o, clumpId))

		// clamp modifier
		paths.forEach((p) => {
			morphPathTo(p, clumpPath, new Ramp1(0.35, 0.7, 0.6, 0.8))
		})

		return paths
	}

	lowerPath(path: HairPoint[], amount: number) {
		path.forEach((el) => {
			el.pos[2] = el.pos[2] * amount
		})
	}

	createStray(origins: [number, number, number][], clumpId: number): HairPath[] {
		const paths = origins.map((o) => this.createPath(o, clumpId))
		return paths
	}

	addPath(p1: THairPath, p2: THairPath, weight: number, fn?: (t: number) => number) {
		if (!fn) {
			fn = (t: number) => smoothstep(0, 1, t)
		}

		for (let i = 0; i < this.SEGMENTS; i++) {
			const t = i / this.SEGMENTS
			const k = fn(t) * weight
			p1[i].pos[0] = p1[i].pos[0] + (p2[i].pos[0] - p1[i].pos[0]) * k
			// ignore y in this case
			// p1[i].pos[1] = p1[i].pos[1] + (p2[i].pos[1] - p1[i].pos[1]) * k
			p1[i].pos[2] = p1[i].pos[2] + (p2[i].pos[2] - p1[i].pos[2]) * k
		}
	}

	createPath(origin: [number, number, number], clumpId: number): HairPath {
		let path = []

		// BOI it's a mess
		const freq1 = rand() * 20 + 5
		const freq2 = rand() * 20 + 5
		const elev = rand() * this.ELEVATION
		const len = this.rect.h * (0.96 - rand() * 0.4)
		const phase = rand() * 20 * Math.PI
		const varRand = (0.5 + 0.5 * rand()) * this.variance

		for (let i = 0; i < this.SEGMENTS; ++i) {
			const t = i / this.SEGMENTS
			let w = this.mapWidth(t, this.width)
			let x = origin[0] + Math.sin(freq1 * t + phase) * varRand
			let y = origin[1] - t * len
			let z = elev + Math.sin(freq2 * t + phase) * varRand
			z *= this.mapElev(t)
			// clamp z to avoid clipping
			z = z < w ? w : z

			let point = {
				pos: [x, y, z] as Vector3Tuple,
				width: w,
			}
			path.push(point)
		}

		// TODO ::: fix this
		const hp = new HairPath()
		hp.origin = origin
		hp.clumpId = clumpId
		hp.points = path
		return hp
	}

	mapWidth(t: number, maxWidth: number) {
		return maxWidth * new WidthProfile().get(t)
	}

	mapElev(t: number) {
		const tip = 0.12
		if (t < tip) {
			return Math.sqrt(t / tip)
		}
		return 1
	}

	createMeshes() {
		this.geos = this.paths.map((p) => createGeo(p))
	}

	getGeo() {
		return this.geos
	}
}
