import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';

@Injectable()
export class EmployeeDepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  /** دریافت تمام دپارتمان‌ها */
  async findAll(): Promise<Department[]> {
    return await this.departmentRepository.find({
      order: { name: 'ASC' },
    });
  }

  /** دریافت یک دپارتمان با شناسه */
  async findOne(id: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });
    if (!department) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }
    return department;
  }
}
