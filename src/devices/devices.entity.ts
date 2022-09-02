import { ConcsEntity } from "src/conclusions/concs.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class DevicesEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    dem: string // denomination

    @Column()
    model: string

    @Column()
    sn: string

    @ManyToMany(type => ConcsEntity, concs => concs.devices)
    @JoinTable()
    concs?: ConcsEntity[]
}