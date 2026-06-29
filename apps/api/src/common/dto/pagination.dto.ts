import { Type } from 'class-transformer';
import {
  IsOptional,
  IsPositive,
  IsString,
  Min,
  Max,
  IsEnum,
} from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}

export class PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
