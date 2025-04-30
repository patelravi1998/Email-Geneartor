import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
  } from 'typeorm';
  
  @Entity('system_user')
  export class SystemUser extends BaseEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id!: number;
  
    @Column({ type: 'varchar' })
    email!: string;

    @Column({ type: 'varchar' })
    password!: string;

    @Column({ type: 'varchar' ,nullable:true,default:null})
    resetPasswordToken!: string;

    @Column({ type: 'varchar' ,nullable:true,default:null})
    resetPasswordExpires!: string;
  
    @Column({ type: 'tinyint', default: 1 })
    status?: number;
  
    @CreateDateColumn({ type: 'datetime' })
    created_at!: Date;
  
    @UpdateDateColumn({ type: 'datetime' })
    updated_at!: Date;
  }
  