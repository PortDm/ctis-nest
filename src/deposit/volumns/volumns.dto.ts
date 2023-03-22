import { CasesEntity } from "../cases/cases.entity"

export class VolumnsCreateDto {
    case: CasesEntity
    volume: string
}