import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { User } from '../auth/entities/user.entity';
import { EmployeeAttendancesService } from './services/employee-attendance.service';
import { EmployeeAttendancesController } from './controllers/employee-attendance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance, User])],
  controllers: [EmployeeAttendancesController],
  providers: [EmployeeAttendancesService],
})
export class AttendanceModule {}
