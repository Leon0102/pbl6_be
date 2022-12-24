import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches } from 'class-validator';

export class ForgotPasswordDto {
    @IsEmail()
    @ApiProperty()
    @Matches(/^[\w+.-]+@[\dA-Za-z-]+\.[\d.A-Za-z-]+$/, {
        message: 'please enter a valid email address'
    })
    readonly email: string;
}
