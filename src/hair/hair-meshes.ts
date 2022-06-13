import * as THREE from 'three'
import { HairGenerator, TGeo } from 'src/hair/hair-generator'
import { rand, resetRand } from 'src/lib/random'
import { removeMeshes } from './scene-helpers'

export type TMesh = THREE.Mesh<THREE.BufferGeometry, any>

export type TGeoGroup = TGeo[][]

export const GROUPS_COUNT = 5
let geoGroup: TGeoGroup

export const getGeoGroup = () => {
  return geoGroup
}

export const clearGeoGroup = () => {
  geoGroup = []
}

export const generateHair = (s: string = '') => {
  return new Promise((resolve) => {
    let geos: THREE.BufferGeometry[] = []
    resetRand(s)

    let card1 = new HairGenerator({
      rect: {
        x: 0.01,
        y: 0.99,
        w: 0.2,
        h: 1,
      },
      clampCount: 12,
      density: 0.4,
    })
    geos = geos.concat(card1.getGeo())

    let card2 = new HairGenerator({
      rect: {
        x: 0.23,
        y: 0.99,
        w: 0.2,
        h: 1,
      },
      density: 0.3,
    })
    geos = geos.concat(card2.getGeo())

    let card3 = new HairGenerator({
      rect: {
        x: 0.45,
        y: 0.99,
        w: 0.15,
        h: 1,
      },
      density: 0.2,
    })
    geos = geos.concat(card3.getGeo())

    let card4 = new HairGenerator({
      rect: {
        x: 0.63,
        y: 0.99,
        w: 0.1,
        h: 1,
      },
      density: 0.1,
    })
    geos = geos.concat(card4.getGeo())

    let card5 = new HairGenerator({
      rect: {
        x: 0.76,
        y: 0.99,
        w: 0.05,
        h: 1,
      },
      density: 0.05,
    })
    geos = geos.concat(card5.getGeo())

    let card6 = new HairGenerator({
      rect: {
        x: 0.86,
        y: 0.99,
        w: 0.05,
        h: 1,
      },
      density: 0.02,
    })
    geos = geos.concat(card6.getGeo())

    let card7 = new HairGenerator({
      rect: {
        x: 0.94,
        y: 0.99,
        w: 0.03,
        h: 1,
      },
      density: 0.01,
    })
    geos = geos.concat(card7.getGeo())

    if (geoGroup && geoGroup.length) throw new Error('Geometry already exists')
    geoGroup = new Array(5).fill(undefined).map(() => {
      return []
    })

    geos.forEach((geo) => {
      const groupIdx = Math.floor(rand() * GROUPS_COUNT)
      geoGroup[groupIdx].push(geo)
    })

    resolve(null)
  })
}
