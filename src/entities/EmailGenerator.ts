import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
  } from 'typeorm';
  
  @Entity('email_generator')
  export class EmailGenerator extends BaseEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id!: number;
  
    @Column({ type: 'varchar' })
    generated_email!: string;

    @Column({ type: 'varchar' })
    ipaddress!: string;
  
    @Column({ type: 'tinyint', default: 1 })
    status?: number;
  
    @CreateDateColumn({ type: 'datetime' })
    created_at!: Date;
  
    @UpdateDateColumn({ type: 'datetime' })
    updated_at!: Date;
  }
  