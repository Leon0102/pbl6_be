import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { Order } from '../constants/order-type.enum';
export class PageOptionsDto {
    @IsEnum(Order)
    @ApiPropertyOptional({
        enum: Order,
        default: Order.ASC,
    })
    readonly order: Order = Order.ASC;

    @IsNumber()
    @ApiPropertyOptional({
        default: 1,
    })
    readonly page: number = 1;

    @IsNumber()
    @ApiPropertyOptional({
        default: 10,
    })
    readonly take: number = 10;

    get skip(): number {
        return (this.page - 1) * this.take;
    }

    // @IsString()
    // @ApiPropertyOptional()
    // readonly q?: string;
}
