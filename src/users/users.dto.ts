export class UsersCreateDto {
    lastName: string
    firstName: string
    middleName: string
    dep: string
    post: string
    rank: string
    login: string
    passwordAES: string
    birth: string
    groupsIds: number[]
}

export class UsersUpdateDto {
    id: number
    lastName: string
    firstName: string
    middleName: string
    dep: string
    post: string
    rank: string
    login: string
    passwordAES: string
    birth: Date
    groupsIds: number[]
}

export class LoginAndPassDto {
    login: string
    passwordAES: string
}

export class LoginResponce {
    id: number
    tokenHash: string
    expiresIn: Date
    userName: string
    userGroups: string[]
}
