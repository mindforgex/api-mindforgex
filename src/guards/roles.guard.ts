import {
  CanActivate,
  ExecutionContext,
  mixin,
  Type,
  UnauthorizedException,
} from '@nestjs/common';

import { Role } from 'src/modules/users/constants/user.constant';

export const RolesGuard = (...roles: Role[]): Type<CanActivate> => {
  class RolesGuardMixin implements CanActivate {
    matchRoles = (roles: Role[], userRole: Role) => roles.includes(userRole);

    canActivate(context: ExecutionContext) {
      if (!roles.length) return true;

      const request = context.switchToHttp().getRequest();
      if (!request.user) throw new UnauthorizedException();

      return this.matchRoles(roles, request.user.role);
    }
  }

  return mixin(RolesGuardMixin);
};
