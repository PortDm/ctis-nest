import { UsersEntity } from "src/admin/users/users.entity"

export class PasswordsCreateDto {
    user: UsersEntity
    passAES: string
}