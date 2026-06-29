import {
  IsString,
  IsOptional,
  IsArray,
  MaxLength,
  IsEnum,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export enum PostType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  CAROUSEL = 'CAROUSEL',
  REEL = 'REEL',
}

export class CreatePostDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2200)
  caption?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  mediaUrls: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(30)
  hashtags?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  mentions?: string[];

  @ApiPropertyOptional({ enum: PostType, default: PostType.PHOTO })
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;
}
