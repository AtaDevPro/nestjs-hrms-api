import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IsNull, Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { UserRole } from '../../shared/enums/user-role.enum';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly rtRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(
    mobile: string,
    password: string,
    role: UserRole = UserRole.EMPLOYEE,
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      mobile,
      password: hashedPassword,
      role,
    });

    return this.userRepository.save(user);
  }

  async validateUser(mobile: string, password: string) {
    const user = await this.userRepository.findOne({ where: { mobile } });
    if (!user)
      throw new NotFoundException('کاربری با این شماره موبایل یافت نشد');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('رمز عبور وارد شده اشتباه است');

    return user;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      role: user.role,
    };

    // Access Token
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRE') || '15m',
    });

    // Refresh Token
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRE') || '14d',
      },
    );

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const refreshTokenEntity = this.rtRepository.create({ tokenHash, user });
    await this.rtRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async refreshToken(oldRefreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(oldRefreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('رفرش توکن نامعتبر است');
    }
    const userId = payload.sub;

    const refreshTokens = await this.rtRepository.find({
      where: { user: { id: userId }, revokedAt: IsNull() },
      relations: { user: true },
    });

    for (const refreshToken of refreshTokens) {
      const isValidToken = await bcrypt.compare(
        oldRefreshToken,
        refreshToken.tokenHash,
      );

      if (isValidToken) {
        refreshToken.revokedAt = new Date();
        await this.rtRepository.save(refreshToken);

        const user = refreshToken.user;

        const payload = {
          sub: user.id,
          role: user.role,
        };

        // Access Token
        const newAccessToken = this.jwtService.sign(payload, {
          secret: this.configService.get('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRE') || '15m',
        });

        // Refresh Token
        const newRefreshToken = this.jwtService.sign(
          { sub: user.id },
          {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRE') || '14d',
          },
        );

        const tokenHash = await bcrypt.hash(newRefreshToken, 10);
        const refreshTokenEntity = this.rtRepository.create({
          tokenHash,
          user,
        });
        await this.rtRepository.save(refreshTokenEntity);

        return {
          newAccessToken,
          newRefreshToken,
        };
      }
    }
  }

  async logout(userId: number) {
    await this.rtRepository
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revokedAt: () => 'NOW()' })
      .where('userId = :id', { id: userId })
      .execute();
  }

  async findUserById(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('کاربری یافت نشد');
    return user;
  }
}
