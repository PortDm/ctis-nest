import { PointsEntity } from "../points/points.entity"

export class DevicesCreateDto {
    dem: string // denomination
    model: string
    sn: string
    point?: string
    listId?: number
}

export class DevicesUpdateDto {
    dem: string // denomination
    model: string
    sn: string
    point?: string
    listId?: number
}

export class DeviceUniqDto {
    sn: string
}

export class DevicesCreate {
    dem: string // denomination
    model: string
    sn: string
    points?: PointsEntity[]
}


export class FilterDevisesDto {
    dem: string // denomination
    model: string
    sn: string
}