import { DevicesEntity } from "src/deposit/devices/devices.entity";
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ListsEntity } from "../lists/lists.entity";
import { VolumnsEntity } from "../volumns/volumns.entity";

@Entity()
export class ConcsEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    reg: string

    @Column()
    date: Date

    @Column()
    countOfLists: number
    
    @OneToMany(type => ListsEntity, lists => lists.conc)
    lists: ListsEntity[]

    @ManyToOne(type => VolumnsEntity, volume => volume.concs)
    volume: VolumnsEntity

    // @ManyToMany(type => DevicesEntity, devices => devices.concs, {onDelete: 'SET NULL'})
    // devices?: DevicesEntity[]
}