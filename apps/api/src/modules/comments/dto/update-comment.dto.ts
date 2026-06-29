import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(2200)
  text: string;
}
