import { IsBoolean, IsOptional, IsArray, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  MENTION = 'MENTION',
  MESSAGE = 'MESSAGE',
  BATTLE_INVITE = 'BATTLE_INVITE',
  BATTLE_RESULT = 'BATTLE_RESULT',
  ACHIEVEMENT = 'ACHIEVEMENT',
  SYSTEM = 'SYSTEM',
  TRENDING = 'TRENDING',
  SUBSCRIPTION = 'SUBSCRIPTION',
  TIP = 'TIP',
}

export class NotificationSettingsDto {
  @ApiPropertyOptional({ description: 'Enable push notifications' })
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable email notifications' })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Specific notification types to mute',
    example: ['SYSTEM', 'TRENDING'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(NotificationType, { each: true })
  mutedTypes?: NotificationType[];

  @ApiPropertyOptional({ description: 'Enable quiet hours' })
  @IsOptional()
  @IsBoolean()
  quietHoursEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Quiet hours start (HH:mm)', example: '22:00' })
  @IsOptional()
  @IsString()
  quietHoursStart?: string;

  @ApiPropertyOptional({ description: 'Quiet hours end (HH:mm)', example: '08:00' })
  @IsOptional()
  @IsString()
  quietHoursEnd?: string;
}
