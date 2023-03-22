import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CasesEntity } from "../cases/cases.entity";
import { ConcsEntity } from "../conclusions/concs.entity";

@Entity()
export class VolumnsEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    volume: string

    @OneToMany(type => ConcsEntity, concs => concs.volume)
    concs: ConcsEntity[]

    @ManyToOne(type => CasesEntity, cas => cas.volumns)
    case: CasesEntity
}