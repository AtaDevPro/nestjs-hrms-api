import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from '../entities/attendance.entity';
import { IsNull, Repository } from 'typeorm';
import { FilterAttendanceDto } from '../dto/filter-attendance.dto';

@Injectable()
export class EmployeeAttendancesService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  async checkIn(userId: number, j_date: string, notes?: string) {
    if (!j_date) throw new BadRequestException('تاریخ را وارد کنید');

    const openedAttendance = await this.attendanceRepository.find({
      where: {
        user: { id: userId },
        checkOutTime: IsNull(),
        j_date,
      },
    });

    if (openedAttendance.length)
      throw new BadRequestException(
        'یک تردد باز داری که هنوز خروجش رو ثبت نکردی',
      );

    const attendance = this.attendanceRepository.create({
      user: { id: userId },
      checkInTime: new Date(),
      notes: notes || null,
      j_date,
    });
    return await this.attendanceRepository.save(attendance);
  }

  async checkOut(userId: number, j_date: string, notes?: string) {
    const attendance = await this.attendanceRepository.findOne({
      where: {
        user: { id: userId },
        checkOutTime: IsNull(),
        j_date,
      },
      order: { checkInTime: 'DESC' },
    });

    if (!attendance)
      throw new NotFoundException('هیچ رکورد ورودی بدون خروج یافت نشد');

    attendance.checkOutTime = new Date();

    if (notes) {
      attendance.notes = attendance.notes
        ? `${attendance.notes} - ${notes}`
        : notes;
    }

    return await this.attendanceRepository.save(attendance);
  }

  async findMyAttendance(userId: number, filters: FilterAttendanceDto) {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendances')
      .where('attendances.userId = :userId', { userId });

    if (filters.startTime) {
      queryBuilder.andWhere('attendances.j_date >= :startTime', {
        startTime: filters.startTime,
      });
    }

    if (filters.endTime) {
      queryBuilder.andWhere('attendances.j_date <= :endTime', {
        endTime: filters.endTime,
      });
    }

    return await queryBuilder
      .orderBy('attendances.checkInTime', 'DESC')
      .getMany();
  }
}
