import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class ResetPasswordDto {
    @IsEmail()
    @ApiProperty()
    @Matches(/^[\w+.-]+@[\dA-Za-z-]+\.[\d.A-Za-z-]+$/, {
        message: 'please enter a valid email address'
    })
    email: string;

    @IsString()
    @ApiProperty()
    newPassword: string;
}
