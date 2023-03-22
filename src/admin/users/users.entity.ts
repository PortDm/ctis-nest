import { GroupsEntity } from "src/admin/groups/groups.entity";
import { PasswordsEntity } from "src/admin/passwords/passwords.entity";
import { TokensEntity } from "src/admin/tokens/tokens.entity";
import { Column, Entity, ManyToMany, JoinTable, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UsersEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    lastName: string

    @Column()
    firstName: string

    @Column()
    middleName: string

    @Column({
        unique: true
    })
    login: string

    @Column()
    passwordHash: string

    @Column()
    dep: string
    
    @Column()
    post: string

    @Column()
    rank: string

    @Column({
        default: '1970-01-01'
    })
    birth: Date

    @OneToMany(type => PasswordsEntity, pass => pass.user)
    passAESOlds: PasswordsEntity[]

    @ManyToMany(type => GroupsEntity, groups => groups.users)
    @JoinTable()
    groups: GroupsEntity[]

    @OneToMany(type => TokensEntity, token => token.user)
    tokens: TokensEntity[]

    toString(): string {
        return `${this.lastName} ${this.firstName} ${this.middleName} ${this.login} ${this.dep} ${this.post} ${this.rank} ${this.birth} ${this.passwordHash}`
    }
}