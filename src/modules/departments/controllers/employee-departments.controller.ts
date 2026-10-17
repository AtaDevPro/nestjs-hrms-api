import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Department } from '../entities/department.entity';
import { EmployeeDepartmentsService } from '../services/employee-departments.service';

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
