import { UsersEntity } from "src/users/users.entity"

export class PasswordsCreateDto {
    user: UsersEntity
    passAES: string
}