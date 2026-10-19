import { ResponseError } from '../../common/dtos/common.response.dto';

export class RbacException {
  static ROLE_NOT_FOUND() {
    return new ResponseError({
      statusCode: 404,
      message: 'Role not found',
      messageCode: 'rbac.error.roleNotFound',
    });
  }

  static ROLE_CODE_EXISTED() {
    return new ResponseError({
      statusCode: 409,
      message: 'Role code already exists',
      messageCode: 'rbac.error.roleCodeExisted',
    });
  }

  static SYSTEM_ROLE_LOCKED() {
    return new ResponseError({
      statusCode: 400,
      message: 'System role cannot be changed',
      messageCode: 'rbac.error.systemRoleLocked',
    });
  }

  static INVALID_PERMISSION() {
    return new ResponseError({
      statusCode: 400,
      message: 'Permission does not exist',
      messageCode: 'rbac.error.invalidPermission',
    });
  }

  static LAST_ADMIN() {
    return new ResponseError({
      statusCode: 400,
      message: 'Cannot remove the last admin',
      messageCode: 'rbac.error.lastAdmin',
    });
  }
}
