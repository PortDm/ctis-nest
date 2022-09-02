import { ConcsEntity } from "src/conclusions/concs.entity"

export class DevicesCreateDto {
    dem: string // denomination
    model: string
    sn: string
    concsIds?: number[]
}