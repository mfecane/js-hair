import { create, RandomSeed } from 'random-seed'

export const SEED = 'seed'
let randomSeed: RandomSeed

export const resetRand = (seed?: string) => {
  randomSeed = create(seed || SEED)
}

export const rand = () => {
  return randomSeed.random()
}

resetRand()
