import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../../prisma/prisma.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
    private i18n: I18nService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 跳过公开接口和登录接口
    if (isPublic || request.path === '/api/auth/login' || request.path === '/auth/login') {
      return next.handle();
    }

    const startTime = Date.now();
    const method = request.method;
    const path = request.path;
    const params = JSON.stringify({
      query: request.query,
      body: request.body,
      params: request.params,
    });
    const ip = request.ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'];
    const userId = request.user?.id;

    return next.handle().pipe(
      tap({
        next: async (data) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          const responseData = JSON.stringify(data);

          if (userId) {
            try {
              await this.prisma.operationLog.create({
                data: {
                  userId,
                  method,
                  path,
                  params,
                  response: responseData,
                  statusCode,
                  ip,
                  userAgent,
                  duration,
                },
              });
            } catch (error) {
              console.error(this.i18n.t('common.operation_log_failed'), error);
            }
          }
        },
        error: async (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;
          const responseData = JSON.stringify({ message: error.message });

          if (userId) {
            try {
              await this.prisma.operationLog.create({
                data: {
                  userId,
                  method,
                  path,
                  params,
                  response: responseData,
                  statusCode,
                  ip,
                  userAgent,
                  duration,
                },
              });
            } catch (logError) {
              console.error(this.i18n.t('common.operation_log_failed'), logError);
            }
          }
        },
      }),
    );
  }
}

