import { User } from '../../../modules/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PayrollStatus } from '../enums/payroll-status.enum';

@Entity('payrolls')
export class Payroll {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({ name: 'salary_period', type: 'varchar', length: 7 })
  salaryPeriod: string;

  @Column({ name: 'base_salary' })
  baseSalary: number;

  @Column({ default: 0 })
  bonuses: number;

  @Column({ default: 0 })
  deductions: number;

  @Column({ name: 'total_amount' })
  totalAmount: number;

  @Column({ type: 'enum', enum: PayrollStatus, default: PayrollStatus.PENDING })
  status: PayrollStatus;

  @Column({ name: 'payment_date', type: 'timestamp', nullable: true })
  paymentDate: Date | null;

  @Column({ type: 'varchar', length: 250, nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
