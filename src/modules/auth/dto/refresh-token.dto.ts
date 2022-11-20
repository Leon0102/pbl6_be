import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
    @ApiProperty({ example: 'accessToken', description: 'accessToken' })
    @IsString()
    @IsNotEmpty()
    accessToken: string;

    @ApiProperty({ example: 'refreshToken', description: 'RefreshToken' })
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}
