import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiLogEntity, ErrLogEntity } from '@sammo-ts/infra';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(
    @InjectRepository(ApiLogEntity)
    private apiLogRepository: Repository<ApiLogEntity>,
    @InjectRepository(ErrLogEntity)
    private errLogRepository: Repository<ErrLogEntity>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, query, ip } = req;
    const startTime = Date.now();

    return next.handle().pipe(
      tap((data) => {
        const responseTime = Date.now() - startTime;
        const res = context.switchToHttp().getResponse();
        const statusCode = res.statusCode;

        // 비동기로 로그 저장 (응답 지연 방지)
        this.apiLogRepository.save({
          member_id: req.user?.userId,
          method,
          path: url,
          query,
          body,
          status_code: statusCode,
          response_time: responseTime,
          ip,
        }).catch(err => this.logger.error('Failed to save API log', err));
      }),
      catchError((err) => {
        const responseTime = Date.now() - startTime;
        
        this.apiLogRepository.save({
          member_id: req.user?.userId,
          method,
          path: url,
          query,
          body,
          status_code: err.status || 500,
          response_time: responseTime,
          ip,
        }).catch(logErr => this.logger.error('Failed to save API log on error', logErr));

        this.errLogRepository.save({
          member_id: req.user?.userId,
          type: err.name || 'Error',
          message: err.message,
          stack: err.stack,
          context: {
            method,
            url,
            body,
            query,
          },
        }).catch(logErr => this.logger.error('Failed to save error log', logErr));

        return throwError(() => err);
      }),
    );
  }
}
