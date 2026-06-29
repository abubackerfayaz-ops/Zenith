import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StoryReactionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emoji?: string;
}

export class StoryReplyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reply?: string;
}
