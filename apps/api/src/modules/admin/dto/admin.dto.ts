import { IsString, IsOptional, IsEmail, IsEnum, IsBoolean, MinLength, MaxLength, IsNumber, Min, IsUrl, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
  USER = 'USER',
  CREATOR = 'CREATOR',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'john_doe' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username?: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isBanned?: boolean;
}

export class CreateAdDto {
  @ApiProperty({ example: 'Summer Sale Banner' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ example: 'https://example.com/landing' })
  @IsUrl()
  targetUrl: string;

  @ApiProperty({ example: 'Check out our summer collection!' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: '2026-07-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2026-08-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyBudget?: number;

  @ApiProperty({ example: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalBudget?: number;
}

export class UpdateAdDto {
  @ApiPropertyOptional({ example: 'Summer Sale Banner' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  targetUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyBudget?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalBudget?: number;
}

export class UserFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isBanned?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class ResolveReportDto {
  @ApiProperty({ example: 'Spam content removed, warning issued' })
  @IsString()
  @MaxLength(1000)
  resolution: string;

  @ApiProperty()
  @IsString()
  @IsEnum(['DISMISSED', 'ACTION_TAKEN', 'BANNED'])
  action: 'DISMISSED' | 'ACTION_TAKEN' | 'BANNED';
}
