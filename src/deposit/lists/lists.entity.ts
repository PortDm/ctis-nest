import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ConcsEntity } from "../conclusions/concs.entity";
import { PointsEntity } from "../points/points.entity";

@Entity()
export class ListsEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    list: number

    @OneToMany(type => PointsEntity, points => points.list)
    points: PointsEntity[]

    @ManyToOne(type => ConcsEntity, conc => conc.lists)
    conc: ConcsEntity

    // @ManyToOne(type => VolumnsEntity, volume => volume.lists)
    // volume: VolumnsEntity
}