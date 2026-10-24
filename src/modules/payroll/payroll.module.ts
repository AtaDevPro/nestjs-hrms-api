import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payroll } from './entities/payroll.entity';
import { User } from '../auth/entities/user.entity';
import { ManagerPayrollService } from './services/manager-payroll.service';
import { ManagerPayrollController } from './controllers/manager-payroll.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Payroll, User])],
  controllers: [ManagerPayrollController],
  providers: [ManagerPayrollService],
})
export class PayrollModule {}
