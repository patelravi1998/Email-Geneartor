import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
  } from 'typeorm';
  
  @Entity('referal')
  export class Referal extends BaseEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id!: number;
  
    @Column({ type: 'varchar' })
    referal_to_email!: string;

    @Column({ type: 'varchar' })
    referal_by_email!: string;
  
    @Column({ type: 'tinyint', default: 0 })
    is_referal_given?: number;
  
    @CreateDateColumn({ type: 'datetime' })
    created_at!: Date;
  
    @UpdateDateColumn({ type: 'datetime' })
    updated_at!: Date;
  }
  