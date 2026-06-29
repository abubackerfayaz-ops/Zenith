import { IsString, IsOptional, IsNumber, IsEnum, Min, Max, MinLength, MaxLength, IsPositive, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum SubscriptionInterval {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class DepositDto {
  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(1)
  @Max(1000000)
  amount: number;

  @ApiPropertyOptional({ example: 'Stripe charge_xxx' })
  @IsOptional()
  @IsString()
  paymentProvider?: string;

  @ApiPropertyOptional({ example: 'charge_xxx' })
  @IsOptional()
  @IsString()
  paymentId?: string;
}

export class WithdrawDto {
  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(1)
  @Max(1000000)
  amount: number;

  @ApiProperty({ example: 'paypal' })
  @IsString()
  @MinLength(1)
  payoutMethod: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  @MinLength(1)
  payoutAddress: string;
}

export class CreateSubscriptionTierDto {
  @ApiProperty({ example: 'Premium' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Access to exclusive content and badges' })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description: string;

  @ApiProperty({ example: 9.99 })
  @IsNumber()
  @IsPositive()
  @Max(999.99)
  price: number;

  @ApiProperty({ enum: SubscriptionInterval, default: SubscriptionInterval.MONTHLY })
  @IsEnum(SubscriptionInterval)
  interval: SubscriptionInterval;

  @ApiPropertyOptional({ example: ['exclusive_content', 'badge', 'priority_support'] })
  @IsOptional()
  benefits?: string[];
}

export class SendTipDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  @Max(100000)
  amount: number;

  @ApiPropertyOptional({ example: 'Great content! 👏' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

export class TransactionFilterDto {
  @ApiPropertyOptional({ enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({ enum: TransactionStatus })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

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
