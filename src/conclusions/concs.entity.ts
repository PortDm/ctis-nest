import { DevicesEntity } from "src/devices/devices.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ConcsEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    reg: string

    @Column()
    date: Date

    @ManyToMany(type => DevicesEntity, devices => devices.concs, {onDelete: 'SET NULL'})
    devices?: DevicesEntity[]
}