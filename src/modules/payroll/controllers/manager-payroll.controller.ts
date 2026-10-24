import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreatePayrollDto } from '../dto/create-payroll.dto';
import { UpdatePayrollDto } from '../dto/update-payroll.dto';
import { FilterPayrollDto } from '../dto/filter-payroll.dto';
import { Payroll } from '../entities/payroll.entity';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { ManagerPayrollService } from '../services/manager-payroll.service';

@ApiBearerAuth()
@Roles(UserRole.MANAGER)
@Controller('manager/payroll')
export class ManagerPayrollController {
  constructor(private readonly payrollService: ManagerPayrollService) {}

  @Post()
  @ApiOperation({ summary: 'ایجاد رکورد حقوق و دستمزد جدید' })
  async create(@Body() dto: CreatePayrollDto): Promise<Payroll> {
    return await this.payrollService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'دریافت تمام رکوردهای حقوق و دستمزد' })
  async findAll(@Query() filters: FilterPayrollDto): Promise<Payroll[]> {
    return await this.payrollService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت یک رکورد حقوق و دستمزد' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Payroll> {
    return await this.payrollService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'به‌روزرسانی رکورد حقوق و دستمزد' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePayrollDto,
  ): Promise<Payroll> {
    return await this.payrollService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف رکورد حقوق و دستمزد' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    await this.payrollService.remove(id);
    return { success: true };
  }
}
