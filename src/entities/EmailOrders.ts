import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
  } from 'typeorm';
  
  @Entity('email_orders')
  export class EmailOrders extends BaseEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id!: number;
  
    @Column({ type: 'varchar' })
    email!: string;

    @Column({ type: 'varchar' })
    ipaddress!: string;

    @Column({ type: 'bigint', nullable: false })
    user_id!: bigint

    @Column({ type: 'varchar' ,default:null,nullable:true})
    razorpay_order_id!: string;
  
    @Column({ type: 'int'})
    days!: number;

    @Column({ type: 'varchar',nullable:true })
    payment_status!: string;

    @Column({ type: 'varchar' ,nullable:true})
    expiry_date!: string;

    @Column({ type: 'int'})
    amount!: number;
  
    @CreateDateColumn({ type: 'datetime' })
    created_at!: Date;
  
    @UpdateDateColumn({ type: 'datetime' })
    updated_at!: Date;
  }
  