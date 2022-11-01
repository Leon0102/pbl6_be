import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AuthDto {
    @ApiProperty({ example: 'email', description: 'Email' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'password', description: 'Password' })
    @IsString()
    @IsNotEmpty()
    password: string;
}
