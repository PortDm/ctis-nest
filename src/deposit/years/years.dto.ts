import { CasesCreateDto } from "../cases/cases.dto"

export class YearsCreateDto {
    year: string
}

export class YearsAddCaseDto {
    yearId: number
    caseCreateDto: CasesCreateDto
}