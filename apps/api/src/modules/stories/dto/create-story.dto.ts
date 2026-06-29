import {
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoryDto {
  @ApiProperty()
  @IsString()
  mediaUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bgColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  textColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  font?: string;
}
