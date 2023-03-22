import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DevicesEntity } from "../devices/devices.entity";
import { ListsEntity } from "../lists/lists.entity";

@Entity()
export class PointsEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    point: string

    @ManyToOne(type => DevicesEntity, device => device.points)
    device: DevicesEntity

    @ManyToOne(type => ListsEntity, list => list.points)
    list: ListsEntity

    // @ManyToOne(type => ListsEntity, lists => lists.points)
    // list: ListsEntity
}