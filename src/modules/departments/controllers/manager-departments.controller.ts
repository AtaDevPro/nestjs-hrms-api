import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { Department } from '../entities/department.entity';
import { ManagerDepartmentsService } from '../services/manager-departments.service';

@Controller('manager/departments')
export class ManagerDepartmentsController {
  constructor(private readonly departmentsService: ManagerDepartmentsService) {}

  /** POST /admin/departments */
  @Post()
  async create(@Body() dto: CreateDepartmentDto): Promise<Department> {
    return await this.departmentsService.create(dto);
  }

  @Get()
  async findAll(): Promise<Department[]> {
    return await this.departmentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Department> {
    return await this.departmentsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<Department> {
    return await this.departmentsService.update(id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    await this.departmentsService.remove(id);
    return { success: true };
  }
}
