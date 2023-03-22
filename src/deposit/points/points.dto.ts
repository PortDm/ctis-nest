import { ListsEntity } from "../lists/lists.entity"

export class PointsCreateDto {
    point: string
    listId: number
}

export class PointsCreate {
    point: string
    list: ListsEntity
}

export class PointUniqDto {
    point: string
    listId: number
}