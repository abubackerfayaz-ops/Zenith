import {
  IsString,
  MinLength,
  ValidateIf,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', required: false })
  @ValidateIf((o) => !o.phone)
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @ValidateIf((o) => !o.email)
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'StrongP@ss123' })
  @IsString()
  @MinLength(1)
  password: string;
}
