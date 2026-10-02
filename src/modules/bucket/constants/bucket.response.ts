import { ResponseError } from '../../common/dtos/common.response.dto';

export class BucketException {
  static FILE_NOT_FOUND_IN_DB() {
    return new ResponseError({
      statusCode: 404,
      message: 'File not found in database',
      messageCode: 'file.error.notFoundDb',
    });
  }

  static FILE_NOT_FOUND_IN_STORAGE() {
    return new ResponseError({
      statusCode: 404,
      message: 'File not found in bucket',
      messageCode: 'file.error.notFoundStorage',
    });
  }

  static FILE_ALREADY_SUBMITTED() {
    return new ResponseError({
      message: 'File is submitted',
      messageCode: 'file.error.alreadySubmitted',
    });
  }
}
