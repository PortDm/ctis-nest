import { DevicesEntity } from "src/deposit/devices/devices.entity"

export class ConcsCreateDto {
    reg: string
    date: Date
    countOfLists: number
}

export class ConcsUpdateDto {
    reg: string
    date: Date
}

export class ConcSewVolumeDto {
    concId: number
    volumeId: number
    startList: number
}