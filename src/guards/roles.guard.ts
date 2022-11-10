import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { JwtGuard } from './jwt.guard';

const RoleGuard = (role: RoleType[]): Type<CanActivate> => {
  class RoleGuardMixin extends JwtGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);
      const request = context.switchToHttp().getRequest<any>();
      const user = request.user;
      // role have user.roleId return true
      return role.map(item => item.toLowerCase()).includes(user.roleId);
    }
  }

  return mixin(RoleGuardMixin);
};

export default RoleGuard;
