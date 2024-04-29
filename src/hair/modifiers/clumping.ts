// clampcount random hairs as clampbase morph items in the same clampgroup towards this spline

import { HairPath } from '../hair-generator'

function setUpIds(hairs: HairPath[], clumping: number): void {
	const clumpX = clumping
	const clumpY = Math.floor(clumping / 2.5)

	hairs.forEach((it) => {
        console.log('it.uv', it.uv)
		const clumpId = clumpY * clumpX * it.uv[0] + clumpY * it.uv[1]
		it.clumpId = clumpId
	})
}

export function makeClumps(hairs: HairPath[], clumping: number): void {
	setUpIds(hairs, clumping)
}
