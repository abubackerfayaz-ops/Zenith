import { IsString, IsArray, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MediaType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  CAROUSEL = 'CAROUSEL',
  REEL = 'REEL',
}

export class PredictViralDto {
  @ApiProperty({ example: 'Check out this amazing sunset!' })
  @IsString()
  caption: string;

  @ApiProperty({ example: ['nature', 'sunset', 'photography'] })
  @IsArray()
  @IsString({ each: true })
  hashtags: string[];

  @ApiProperty({ enum: MediaType, example: MediaType.VIDEO })
  @IsEnum(MediaType)
  mediaType: MediaType;

  @ApiPropertyOptional({ example: '2024-03-15T18:00:00Z' })
  @IsOptional()
  @IsString()
  scheduledTime?: string;
}
