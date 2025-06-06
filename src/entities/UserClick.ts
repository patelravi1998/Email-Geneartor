import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
  } from 'typeorm';
  
  @Entity('user_click')
  export class UserClick extends BaseEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id!: number;
  
    @Column({ type: 'varchar' })
    temp_mail!: string;

    @Column({ type: 'varchar' })
    ipaddress!: string;
  
    @Column({ type: 'tinyint', default: 1 })
    status?: number;

    @Column({ type: 'date', nullable: true })
    expiration_date?: string;
  
    @CreateDateColumn({ type: 'datetime' })
    created_at!: Date;
  
    @UpdateDateColumn({ type: 'datetime' })
    updated_at!: Date;
  }
  