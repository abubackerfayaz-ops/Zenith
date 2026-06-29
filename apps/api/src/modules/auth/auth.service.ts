import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../common/prisma.module';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'localhost'),
      port: this.config.get<number>('SMTP_PORT', 587),
      auth: {
        user: this.config.get<string>('SMTP_USER', ''),
        pass: this.config.get<string>('SMTP_PASS', ''),
      },
      secure: this.config.get<number>('SMTP_PORT', 587) === 465,
    });
  }

  async register(dto: RegisterDto) {
    const existingEmail = await this.usersService.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    const existingUsername = await this.usersService.findByUsername(dto.username);
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    if (dto.phone) {
      const existingPhone = await this.usersService.findByPhone(dto.phone);
      if (existingPhone) {
        throw new ConflictException('Phone already registered');
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.usersService.create({
      email: dto.email,
      username: dto.username,
      displayName: dto.displayName,
      password: hashedPassword,
      phone: dto.phone,
    });

    const tokens = await this.generateTokens(user.id, user.email, user.username, user.role);

    await this.usersService.update(user.id, { refreshToken: tokens.refreshToken });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    let user;
    if (dto.email) {
      user = await this.usersService.findByEmail(dto.email);
    } else if (dto.phone) {
      user = await this.usersService.findByPhone(dto.phone);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('Account uses social login');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.username, user.role);

    await this.usersService.update(user.id, {
      refreshToken: tokens.refreshToken,
      lastLoginAt: new Date().toISOString(),
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async googleLogin(googleId: string) {
    let user = await this.usersService.findByGoogleId(googleId);

    if (!user) {
      throw new UnauthorizedException('Google account not linked to any user');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.username, user.role);

    await this.usersService.update(user.id, {
      refreshToken: tokens.refreshToken,
      lastLoginAt: new Date().toISOString(),
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async appleLogin(appleId: string) {
    let user = await this.usersService.findByAppleId(appleId);

    if (!user) {
      throw new UnauthorizedException('Apple account not linked to any user');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.username, user.role);

    await this.usersService.update(user.id, {
      refreshToken: tokens.refreshToken,
      lastLoginAt: new Date().toISOString(),
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.username, user.role);

      await this.usersService.update(user.id, { refreshToken: tokens.refreshToken });

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.usersService.update(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = nanoid(64);
    const hashedToken = await bcrypt.hash(resetToken, 10);
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await this.usersService.update(user.id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: expires.toISOString(),
    });

    const resetUrl = `${this.config.get<string>('FRONTEND_URL', 'http://localhost:3000')}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email!)}`;

    try {
      await this.transporter.sendMail({
from:  this.config.get<string>('SMTP_FROM', 'noreply@zenith.com'),
        to: user.email!,
        subject: 'Password Reset Request - Zenith',
        html: `
          <h1>Password Reset</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link expires in 1 hour.</p>
          <p>If you did not request this, please ignore this email.</p>
        `,
      });
    } catch (error) {
      this.logger.error('Failed to send password reset email', error);
    }

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, email: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordResetToken || !user.passwordResetExpires) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (new Date(user.passwordResetExpires) < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    const isTokenValid = await bcrypt.compare(token, user.passwordResetToken);
    if (!isTokenValid) {
      throw new BadRequestException('Invalid reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.usersService.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      refreshToken: null,
    });

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException('Account uses social login, cannot change password');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.usersService.update(userId, {
      password: hashedPassword,
      refreshToken: null,
    });

    return { message: 'Password changed successfully. Please log in again.' };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByEmailVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.usersService.update(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
    });

    return { message: 'Email verified successfully' };
  }

  async sendVerificationEmail(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    if (!user.email) {
      throw new BadRequestException('No email associated with this account');
    }

    const verificationToken = nanoid(64);
    await this.usersService.update(user.id, { emailVerificationToken: verificationToken });

    const verifyUrl = `${this.config.get<string>('FRONTEND_URL', 'http://localhost:3000')}/auth/verify-email?token=${verificationToken}`;

    try {
      await this.transporter.sendMail({
from:  this.config.get<string>('SMTP_FROM', 'noreply@zenith.com'),
        to: user.email,
        subject: 'Verify Your Email - Zenith',
        html: `
          <h1>Email Verification</h1>
          <p>Click the link below to verify your email:</p>
          <a href="${verifyUrl}">${verifyUrl}</a>
          <p>This link expires in 24 hours.</p>
        `,
      });
    } catch (error) {
      this.logger.error('Failed to send verification email', error);
    }

    return { message: 'Verification email sent' };
  }

  async setup2FA(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    const secret = speakeasy.generateSecret({
      name: `Zenith:${user.email ?? user.username}`,
      length: 20,
    });

    await this.usersService.update(userId, { twoFactorSecret: secret.base32 });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode,
    };
  }

  async enable2FA(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestException('2FA not set up. Call setup2FA first');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!verified) {
      throw new BadRequestException('Invalid 2FA code');
    }

    await this.usersService.update(userId, { twoFactorEnabled: true });

    return { message: '2FA enabled successfully' };
  }

  async verify2FA(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('2FA is not enabled');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!verified) {
      throw new BadRequestException('Invalid 2FA code');
    }

    return { message: '2FA code verified successfully' };
  }

  async disable2FA(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('2FA is not enabled');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!verified) {
      throw new BadRequestException('Invalid 2FA code');
    }

    await this.usersService.update(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    });

    return { message: '2FA disabled successfully' };
  }

  async generateTokens(
    userId: string,
    email: string | null | undefined,
    username: string,
    role: string,
  ) {
    const payload = {
      sub: userId,
      email,
      username,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        {
          expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
          secret: this.config.get<string>('JWT_SECRET'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { data: this.sanitizeUser(user) };
  }

  private sanitizeUser(user: any) {
    const { password, refreshToken, twoFactorSecret, passwordResetToken, passwordResetExpires, emailVerificationToken, ...sanitized } = user;
    return sanitized;
  }
}
