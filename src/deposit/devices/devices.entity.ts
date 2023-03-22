import { ConcsEntity } from "src/deposit/conclusions/concs.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PointsEntity } from "../points/points.entity";

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

    @OneToMany(type => PointsEntity, points => points.device)
    points: PointsEntity[]

//     @ManyToMany(type => ConcsEntity, concs => concs.devices)
//     @JoinTable()
//     concs?: ConcsEntity[]
}