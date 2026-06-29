import { IsOptional, IsNumber, IsString, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum RankingSortBy {
  SCORE = 'score',
  FOLLOWERS = 'followers',
  ENGAGEMENT = 'engagement',
  POSTS = 'posts',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class RankingFilterDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: RankingSortBy, default: RankingSortBy.SCORE })
  @IsOptional()
  @IsEnum(RankingSortBy)
  sortBy?: RankingSortBy = RankingSortBy.SCORE;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
