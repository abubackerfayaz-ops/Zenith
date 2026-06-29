import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  participantIds: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isGroup?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;
}
