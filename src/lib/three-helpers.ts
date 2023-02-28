import { Vector3 } from "three";

export function vector3ToTuple(vector3: Vector3): [number, number, number] {
    return [vector3.x, vector3.y, vector3.z]

}