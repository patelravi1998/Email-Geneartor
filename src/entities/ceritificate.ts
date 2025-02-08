import { Time } from "aws-sdk/clients/cloudwatchlogs";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from "typeorm";

@Entity("ceritificate")
export class Ceritificate extends BaseEntity {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id!: number;

  @Column({ type: "varchar", nullable: true })
  name!: string;

  @Column({ type: "varchar", nullable: true })
  mobile!: string;

  @Column({ type: "varchar", nullable: true })
  designation?: string;

  @Column({ type: "varchar", nullable: true })
  certificate!: string;

  @CreateDateColumn({ type: "datetime" })
  created_at!: string;

  @UpdateDateColumn({ type: "datetime" })
  updated_at!: Date;
}
