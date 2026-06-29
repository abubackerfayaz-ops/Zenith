import { IsString, IsOptional, IsBoolean, MaxLength, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReelDto {
  @ApiProperty()
  @IsString()
  @IsUrl()
  videoUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2200)
  caption?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  music?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  allowRemix?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  allowComment?: boolean;
}
