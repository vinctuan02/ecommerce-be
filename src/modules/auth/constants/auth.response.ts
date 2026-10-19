import { ResponseError } from '../../common/dtos/common.response.dto';

export class AuthException {
  static INVALID_CREDENTIALS() {
    return new ResponseError({
      statusCode: 401,
      message: 'Invalid email or password',
      messageCode: 'auth.error.invalidCredentials',
    });
  }

  static ACCOUNT_BLOCKED() {
    return new ResponseError({
      statusCode: 403,
      message: 'Account is blocked',
      messageCode: 'auth.error.accountBlocked',
    });
  }

  static UNAUTHORIZED() {
    return new ResponseError({
      statusCode: 401,
      message: 'Unauthorized',
      messageCode: 'auth.error.unauthorized',
    });
  }

  static INVALID_REFRESH_TOKEN() {
    return new ResponseError({
      statusCode: 401,
      message: 'Invalid refresh token',
      messageCode: 'auth.error.invalidRefreshToken',
    });
  }

  static FORBIDDEN() {
    return new ResponseError({
      statusCode: 403,
      message: 'Forbidden',
      messageCode: 'auth.error.forbidden',
    });
  }

  static INVALID_TOKEN() {
    return new ResponseError({
      statusCode: 400,
      message: 'Token is invalid or expired',
      messageCode: 'auth.error.invalidToken',
    });
  }

  static EMAIL_ALREADY_VERIFIED() {
    return new ResponseError({
      statusCode: 400,
      message: 'Email already verified',
      messageCode: 'auth.error.emailAlreadyVerified',
    });
  }

  static WRONG_CURRENT_PASSWORD() {
    return new ResponseError({
      statusCode: 400,
      message: 'Current password is incorrect',
      messageCode: 'auth.error.wrongCurrentPassword',
    });
  }

  static SAME_PASSWORD() {
    return new ResponseError({
      statusCode: 400,
      message: 'New password must be different from current password',
      messageCode: 'auth.error.samePassword',
    });
  }
}
