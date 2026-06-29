import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  message: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T> | PaginatedResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T> | PaginatedResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        if (this.isPaginated(response)) {
          return {
            success: true as const,
            data: response.data,
            meta: {
              total: response.meta.total,
              page: response.meta.page,
              limit: response.meta.limit,
              totalPages: Math.ceil(response.meta.total / response.meta.limit),
              hasNextPage: response.meta.page * response.meta.limit < response.meta.total,
              hasPreviousPage: response.meta.page > 1,
            },
            message: response.message ?? 'Success',
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true as const,
          data: response?.data ?? response,
          message: response?.message ?? 'Success',
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private isPaginated(
    response: any,
  ): response is { data: any[]; meta: { total: number; page: number; limit: number }; message?: string } {
    return (
      response &&
      Array.isArray(response.data) &&
      response.meta &&
      typeof response.meta.total === 'number' &&
      typeof response.meta.page === 'number' &&
      typeof response.meta.limit === 'number'
    );
  }
}
