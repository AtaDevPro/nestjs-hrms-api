import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Department } from '../entities/department.entity';
import { EmployeeDepartmentsService } from '../services/employee-departments.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../../shared/enums/user-role.enum';

@ApiBearerAuth()
@Roles(UserRole.EMPLOYEE)
@Controller('employee/departments')
export class EmployeeDepartmentsController {
  constructor(
    private readonly departmentsService: EmployeeDepartmentsService,
  ) {}

  /** GET /employee/departments */
  @Get()
  async findAll(): Promise<Department[]> {
    return await this.departmentsService.findAll();
  }

  /** GET /employee/departments/:id */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Department> {
    return await this.departmentsService.findOne(id);
  }
}
