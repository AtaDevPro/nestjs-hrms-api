import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payroll } from '../entities/payroll.entity';
import { Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { CreatePayrollDto } from '../dto/create-payroll.dto';
import { FilterPayrollDto } from '../dto/filter-payroll.dto';
import { PayrollStatus } from '../enums/payroll-status.enum';
import { UpdatePayrollDto } from '../dto/update-payroll.dto';

@Injectable()
export class ManagerPayrollService {
  constructor(
    @InjectRepository(Payroll)
    private readonly payrollRepository: Repository<Payroll>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreatePayrollDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) throw new NotFoundException('کاربر یافت نشد');

    const hasSalaryPeriod = await this.payrollRepository.findOne({
      where: {
        user: { id: dto.userId },
        salaryPeriod: dto.salaryPeriod,
      },
    });
    if (hasSalaryPeriod)
      throw new BadRequestException(
        'برای این دوره قبلا فیش حقوقی صادر شده است',
      );

    const bonuses = dto.bonuses || 0;
    const deductions = dto.deductions || 0;
    const totalAmount = dto.baseSalary + bonuses - deductions;

    let paymentDate;
    if (dto.status) {
      if (dto.status == PayrollStatus.PAID) paymentDate = new Date();
    }

    const payroll = this.payrollRepository.create({
      user,
      salaryPeriod: dto.salaryPeriod,
      baseSalary: dto.baseSalary,
      bonuses,
      deductions,
      totalAmount,
      paymentDate: paymentDate || null,
      status: dto.status || PayrollStatus.PENDING,
      notes: dto.notes || null,
    });

    return await this.payrollRepository.save(payroll);
  }

  async update(id: number, dto: UpdatePayrollDto) {
    const payroll = await this.findOne(id);

    if (dto.salaryPeriod) payroll.salaryPeriod = dto.salaryPeriod;
    if (dto.baseSalary) payroll.baseSalary = dto.baseSalary;
    if (dto.bonuses) payroll.bonuses = dto.bonuses;
    if (dto.deductions) payroll.deductions = dto.deductions;
    if (dto.notes) payroll.notes = dto.notes;

    if (dto.status) {
      payroll.status = dto.status;
      if (dto.status == PayrollStatus.PAID && !payroll.paymentDate) {
        payroll.paymentDate = new Date();
      }
    }

    payroll.totalAmount =
      payroll.baseSalary + payroll.bonuses - payroll.deductions;

    return await this.payrollRepository.save(payroll);
  }

  async findAll(filters: FilterPayrollDto) {
    const queryBuilder = this.payrollRepository
      .createQueryBuilder('payrolls')
      .leftJoinAndSelect('payrolls.user', 'users');

    if (filters.userId) {
      queryBuilder.andWhere('payrolls.userId = :userId', {
        userId: filters.userId,
      });
    }

    if (filters.salaryPeriod) {
      queryBuilder.andWhere('payrolls.salaryPeriod = :salaryPeriod', {
        salaryPeriod: filters.salaryPeriod,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('payrolls.status = :status', {
        status: filters.status,
      });
    }

    return await queryBuilder
      .orderBy('payrolls.salaryPeriod', 'DESC')
      .addOrderBy('payrolls.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: number) {
    const payroll = await this.payrollRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!payroll) throw new NotFoundException('فیش حقوقی مد نظر شما یافت نشد');

    return payroll;
  }

  async remove(id: number) {
    const payroll = await this.findOne(id);
    await this.payrollRepository.remove(payroll);
  }
}
