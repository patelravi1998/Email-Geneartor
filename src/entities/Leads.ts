import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
  } from 'typeorm';
  
  @Entity('leads')
  export class Leads extends BaseEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id!: number;
  
    @Column({ type: 'varchar',unique:true })
    mobile!: string;

    @Column({ type: 'tinyint', default: 1 })
    is_whatsapp_number_same?: number;

    @Column({ type: 'varchar',nullable:true,default:null })
    whatsapp_number!: string;

    @Column({ type: 'varchar',nullable:true,default:null })
    name!: string;

    @Column({ type: 'varchar', nullable: true, default: null })
    dob?: string ;

    @Column({ type: 'varchar',nullable:true,default:null })
    age!: string;

    @Column({ type: 'varchar',nullable:true,default:null })
    education!: string;

    @Column({ type: 'varchar',nullable:true,default:null })
    state!: string;

    @Column({ type: 'varchar',nullable:true,default:null })
    city!: string;

    @Column({ type: 'varchar',nullable:true,default:null })
    past_job!: string;

    @Column({ type: 'varchar',nullable:true,default:null })
    job_type!: string;

    @Column({ type: 'tinyint', default: 1 })
    willing_to_relocate?: number;

    @Column({ type: 'bigint', nullable: true,default:0 })
    experience!: bigint

    @Column({ type: 'tinyint',nullable:false })
    call_status?: number;
    // 1 = answered,2= not received, 3= disconnected,4=talkfuture,5= notinterested
  
    @CreateDateColumn({ type: 'datetime' })
    created_at!: Date;
  
    @UpdateDateColumn({ type: 'datetime' })
    updated_at!: Date;
  }
  