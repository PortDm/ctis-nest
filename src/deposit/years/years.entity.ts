import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CasesEntity } from "../cases/cases.entity";

@Entity()
export class YearsEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    year: string

    @OneToMany(type => CasesEntity, cases => cases.year)
    cases: CasesEntity[]
}