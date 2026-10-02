import { ResponseError } from '../../common/dtos/common.response.dto';

export class UserException {
  static NOT_FOUND() {
    return new ResponseError({
      statusCode: 404,
      message: 'User not found',
      messageCode: 'user.error.notFound',
    });
  }

  static EMAIL_EXISTED() {
    return new ResponseError({
      statusCode: 409,
      message: 'Email already exists',
      messageCode: 'user.error.emailExisted',
    });
  }
}
