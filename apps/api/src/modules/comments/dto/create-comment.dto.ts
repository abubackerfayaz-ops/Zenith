import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(2200)
  text: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reelId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string;
}
