import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChangePassword {
  @ApiProperty({ example: 'password', description: 'Password' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'newPassword', description: 'New Password' })
  @IsString()
  newPassword: string;
}
