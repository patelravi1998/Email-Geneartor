import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
  } from 'typeorm';
  
  @Entity('user_query')
  export class UserQuery extends BaseEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id!: number;
  
    @Column({ type: 'varchar' })
    email!: string;

    @Column({ type: 'varchar' })
    name!: string;
  
    @Column({ type: 'text' })
    message!: string;

    @Column({ type: 'varchar' })
    mobile!: string;

    @Column({ type: 'tinyint', default: 1 })
    status?: number;
  
    @CreateDateColumn({ type: 'datetime' })
    created_at!: Date;
  
    @UpdateDateColumn({ type: 'datetime' })
    updated_at!: Date;
  }
  