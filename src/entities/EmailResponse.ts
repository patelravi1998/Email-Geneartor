import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
  } from 'typeorm';
  
  @Entity('email_response')
  export class EmailResponse extends BaseEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id!: number;
  
    @Column({ type: 'varchar' ,nullable:true})
    generated_email!: string;

    @Column({ type: 'varchar',nullable:true })
    ipaddress!: string;

    @Column({ type: 'varchar',nullable:true })
    sender_email!: string;

    @Column({ type: 'varchar' ,nullable:true})
    date!: string;
  
    @Column({ type: 'varchar' ,nullable:true})
    subject!: string;

    @Column({ type: 'varchar' ,nullable:true })
    sender_name!: string;

    @Column({ type: "json", nullable: true }) // Use "jsonb" for PostgreSQL
    body!: any;       

    @Column({ type: 'tinyint', default: 1 })
    status?: number;

    @Column({ type: 'text', nullable: true })
    attachments!: string;
    
  
    @CreateDateColumn({ type: 'datetime' })
    created_at!: Date;
  
    @UpdateDateColumn({ type: 'datetime' })
    updated_at!: Date;
  }
  