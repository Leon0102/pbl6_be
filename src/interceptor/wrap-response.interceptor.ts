import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';


@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const ctx = context.switchToHttp().getResponse();
        const statusCode: number = ctx.statusCode;

        return next.handle().pipe(
            map((response) => {
                if (response.message) {
                    return {
                        statusCode,
                        success: true,
                        message: response.message,
                    };
                }
                return {
                    statusCode,
                    success: true,
                    data: response
                };
            })
        );
    }
}
