import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CheckInOutDto } from '../dto/check-in-out.dto';
import { User } from '../../../common/decorators/user.decorator';
import { EmployeeAttendancesService } from '../services/employee-attendance.service';
import { FilterAttendanceDto } from '../dto/filter-attendance.dto';

@ApiBearerAuth()
@Roles(UserRole.EMPLOYEE)
@Controller('employee/attendance')
export class EmployeeAttendancesController {
  constructor(
    private readonly employeeAttendancesService: EmployeeAttendancesService,
  ) {}

  @Post('check-in')
  async checkIn(
    @Body() dto: CheckInOutDto,
    @User() user: { id: number; role: string },
  ) {
    return await this.employeeAttendancesService.checkIn(
      user.id,
      dto.j_date,
      dto.notes,
    );
  }

  @Post('check-out')
  async checkOut(
    @Body() dto: CheckInOutDto,
    @User() user: { id: number; role: string },
  ) {
    return await this.employeeAttendancesService.checkOut(
      user.id,
      dto.j_date,
      dto.notes,
    );
  }

  @Get()
  async findMyAttendance(
    @Query() filters: FilterAttendanceDto,
    @User() user: { id: number },
  ) {
    return await this.employeeAttendancesService.findMyAttendance(
      user.id,
      filters,
    );
  }
}
