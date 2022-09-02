import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { LogsTypes } from "./logs.dto";

@Entity()
export class LogsEntity {
    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn()
    date: Date

    @Column()
    master: string

    @Column()
    action: string

    @Column()
    type: LogsTypes

    @Column({default: ''})
    data: string
}