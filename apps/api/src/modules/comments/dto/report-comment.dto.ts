import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportReason {
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  HATE_SPEECH = 'HATE_SPEECH',
  MISINFORMATION = 'MISINFORMATION',
  BULLYING = 'BULLYING',
  VIOLENCE = 'VIOLENCE',
  SELF_HARM = 'SELF_HARM',
  INAPPROPRIATE = 'INAPPROPRIATE',
  COPYRIGHT = 'COPYRIGHT',
  OTHER = 'OTHER',
}

export class ReportCommentDto {
  @ApiProperty({ enum: ReportReason })
  @IsEnum(ReportReason)
  reason: ReportReason;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
