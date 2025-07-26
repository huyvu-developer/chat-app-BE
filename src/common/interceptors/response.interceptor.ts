import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from '@nestjs/common';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      map((data) => {
        // Ghi log thời gian xử lý request
        this.logger.log(`[${method}] ${url} - ${Date.now() - now}ms`);

        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          message: 'Success',
          data: data || null,
        };
      }),
    );
  }
}
