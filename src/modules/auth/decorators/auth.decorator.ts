import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/enums/user.enum';
import { IS_PUBLIC_KEY, ROLES_KEY } from '../constants/auth.constant';

// route không cần đăng nhập
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// route chỉ cho các role này, không gắn thì chỉ cần đăng nhập
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
