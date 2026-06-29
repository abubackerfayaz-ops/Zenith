import { IsString, IsOptional, IsDateString, IsEnum, MinLength, MaxLength, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BattleCategory {
  MUSIC = 'MUSIC',
  DANCE = 'DANCE',
  COMEDY = 'COMEDY',
  ART = 'ART',
  FASHION = 'FASHION',
  SPORTS = 'SPORTS',
  GAMING = 'GAMING',
  FOOD = 'FOOD',
  EDUCATION = 'EDUCATION',
  LIFESTYLE = 'LIFESTYLE',
  OTHER = 'OTHER',
}

export enum BattleStatus {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateBattleDto {
  @ApiProperty({ example: 'Summer Rap Battle 2026' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Show us your best rap skills and win amazing prizes!' })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ example: '2026-07-01T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-07-15T00:00:00.000Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 'Grand Prize: $10,000 + Trophy' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  prize?: string;

  @ApiProperty({ enum: BattleCategory, example: BattleCategory.MUSIC })
  @IsEnum(BattleCategory)
  category: BattleCategory;
}

export class UpdateBattleDto {
  @ApiPropertyOptional({ example: 'Summer Rap Battle 2026' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description for the battle' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: '2026-07-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-07-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'Grand Prize: $10,000 + Trophy' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  prize?: string;

  @ApiPropertyOptional({ enum: BattleCategory })
  @IsOptional()
  @IsEnum(BattleCategory)
  category?: BattleCategory;

  @ApiPropertyOptional({ enum: BattleStatus })
  @IsOptional()
  @IsEnum(BattleStatus)
  status?: BattleStatus;
}

export class BattleFilterDto {
  @ApiPropertyOptional({ enum: BattleStatus })
  @IsOptional()
  @IsEnum(BattleStatus)
  status?: BattleStatus;

  @ApiPropertyOptional({ enum: BattleCategory })
  @IsOptional()
  @IsEnum(BattleCategory)
  category?: BattleCategory;

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
