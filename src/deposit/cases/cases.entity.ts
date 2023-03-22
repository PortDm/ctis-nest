import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { VolumnsEntity } from "../volumns/volumns.entity";
import { YearsEntity } from "../years/years.entity";

@Entity()
export class CasesEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    case: string

    @OneToMany(type => VolumnsEntity, volumns => volumns.case)
    volumns?: VolumnsEntity[]

    @ManyToOne(type => YearsEntity, year => year.cases)
    year?: YearsEntity
}