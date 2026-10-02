import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ResponseSuccess } from '../dtos/common.response.dto';

// Bọc kết quả trả về của controller vào ResponseSuccess.
// Nếu controller đã tự trả ResponseSuccess (vd: custom message) thì giữ nguyên.
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ResponseSuccess<T> | StreamableFile
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseSuccess<T> | StreamableFile> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof ResponseSuccess || data instanceof StreamableFile) {
          return data;
        }

        return new ResponseSuccess({ data: data ?? undefined });
      }),
    );
  }
}
