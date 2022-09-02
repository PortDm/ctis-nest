import { UsersEntity } from "src/users/users.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PasswordsEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    passAES: string

    @ManyToOne(type => UsersEntity, users => users.passAESOlds, {onDelete: 'CASCADE'})
    user: UsersEntity

}