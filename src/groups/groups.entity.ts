
import { UsersEntity } from "src/users/users.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GroupsEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToMany(type => UsersEntity, users => users.groups, {onDelete: 'CASCADE'})
    users: UsersEntity[]

    toString(): string {
        return `id=${this.id}; '${this.name}'`
    }
}