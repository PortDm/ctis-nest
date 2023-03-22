import { YearsEntity } from "../years/years.entity"

export class CasesCreateDto {
    year: YearsEntity
    case: string
}