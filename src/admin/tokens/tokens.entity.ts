import { UsersEntity } from "src/admin/users/users.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TokensEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    tokenHash: string

    @CreateDateColumn()
    expiresIn: Date

    @ManyToOne(type => UsersEntity, user => user.tokens, {onDelete: 'CASCADE'})
    user: UsersEntity
}