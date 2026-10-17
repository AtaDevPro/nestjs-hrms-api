import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { ManagerDepartmentsService } from './services/manager-departments.service';
import { ManagerDepartmentsController } from './controllers/manager-departments.controller';
import { EmployeeDepartmentsController } from './controllers/employee-departments.controller';
import { EmployeeDepartmentsService } from './services/employee-departments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Department])],
  controllers: [ManagerDepartmentsController, EmployeeDepartmentsController],
  providers: [ManagerDepartmentsService, EmployeeDepartmentsService],
})
export class DepartmentsModule {}
