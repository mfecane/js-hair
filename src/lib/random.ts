import { create, RandomSeed } from 'random-seed'

const SEED = 'ssibal'
let rand: RandomSeed

export const resetRand = (seed?: string) => {
  rand = create(seed || SEED)
}

export const getRand = () => {
  return rand.random()
}

resetRand()
