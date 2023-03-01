import { functions, xor } from 'lodash'

export function mapclamp(
  x: number,
  in_start: number,
  in_end: number,
  out_start: number,
  out_end: number
): number {
  x = x === undefined ? in_end : x
  x = x > in_end ? in_end : x
  x = x < in_start ? in_start : x
  return map(x, in_start, in_end, out_start, out_end)
}

export function map(
  x: number,
  in_start: number,
  in_end: number,
  out_start: number,
  out_end: number
): number {
  let out =
    out_start + ((out_end - out_start) / (in_end - in_start)) * (x - in_start)
  return out
}

export function smoothstep(min: number, max: number, x: number) {
  var t = Math.max(0, Math.min(1, (x - min) / (max - min)))
  return t * t * (3 - 2 * t)
}

export function map01(x: number, min: number, max: number): number {
  return min + x * (max - min)
}

export function hexToRgb(hex: string): string {
  var bigint = parseInt(hex, 16)
  var r = (bigint >> 16) & 255
  var g = (bigint >> 8) & 255
  var b = bigint & 255

  return r + ',' + g + ',' + b
}

export function dist(a: any, b: any) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

export function clamp(x: number, min: number, max: number): number {
  x = x === undefined ? min : x
  x = x > max ? max : x
  x = x < min ? min : x
  return x
}

export const sleep = (msec: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, msec)
  })
}

export const addArrays = (arr1: Array<number>, arr2: Array<number>) => {
  const l = Math.min(arr1.length, arr2.length)
  for (let i = 0; i < l; ++i) {
    arr1[i] = arr1[i] + arr2[i]
  }
  return arr1
}
