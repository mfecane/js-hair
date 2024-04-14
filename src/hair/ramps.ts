import { map, smoothstep } from 'src/lib/lib'

export interface IWeightProvider {
	get(t: number): number
}

/**
 * A combination of 2 smoothsteps
 * one at the root from 0 to weight
 * one at the tip from weight to 1
 */
export class Ramp1 implements IWeightProvider {
	public constructor(
		private readonly root: number,
		private readonly tip: number,
		private readonly weight: number,
		private readonly scale: number = 1.0
	) {}

	public get(t: number): number {
		let value: number
		if (t < this.root) {
			value = smoothstep(0, this.root, t) * this.weight
		} else if (t > this.tip) {
			value = this.weight + (1 - this.weight) * smoothstep(this.tip, 1, t)
		} else {
			value = this.weight
		}
		return value * this.scale
	}
}

/**
 * A combination of 2 smoothsteps
 * one at the root from 0 to weight
 * one at the tip from weight to 1
 */
export class WidthProfile implements IWeightProvider {
	public constructor(
		private readonly root: number = 0.1,
		private readonly tip: number = 0.1,
		private readonly root_width: number = 0.5,
		private readonly tip_width: number = 0.3
	) {}

	public get(t: number): number {
		if (t < this.root) {
			return map(t, 0, this.root, this.root_width, 1.0)
		}
		if (t > 1 - this.tip) {
			return map(t, 1 - this.tip, 1, 1, this.tip_width)
		}
		return 1
	}
}
