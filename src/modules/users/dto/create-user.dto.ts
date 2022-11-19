import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {

    @ApiProperty({ example: 'email', description: 'Email' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password', description: 'Password' })
    @IsString()
    password: string;

    @ApiPropertyOptional({ description: 'Name' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'Phone' })
    @IsString()
    phone: string;

    @ApiPropertyOptional({ description: 'Role' })
    @IsString()
    role_id: string;
}
