import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class OTPDto {
    @IsEmail()
    @ApiProperty()
    @Matches(/^[\w+.-]+@[\dA-Za-z-]+\.[\d.A-Za-z-]+$/)
    readonly email: string;

    @IsString()
    @ApiProperty()
    readonly otpCode: string;
}
