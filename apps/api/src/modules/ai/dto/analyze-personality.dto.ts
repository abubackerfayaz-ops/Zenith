import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsEnum,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ContentType {
  POST = 'POST',
  REEL = 'REEL',
  STORY = 'STORY',
  COMMENT = 'COMMENT',
}

export class ContentSampleDto {
  @ApiProperty({ enum: ContentType })
  @IsEnum(ContentType)
  type: ContentType;

  @ApiProperty({ example: 'Just had the best coffee ever!' })
  @IsString()
  caption: string;

  @ApiPropertyOptional({ example: ['foodie', 'coffee'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @ApiPropertyOptional({ example: 42 })
  @IsOptional()
  @IsNumber()
  likes?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  comments?: number;
}

export class AnalyzePersonalityDto {
  @ApiProperty({ type: [ContentSampleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentSampleDto)
  recentContent: ContentSampleDto[];
}
