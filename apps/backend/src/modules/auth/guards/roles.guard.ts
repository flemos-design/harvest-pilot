import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obter os papéis requeridos do decorator @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se não houver papéis requeridos, permitir acesso
    if (!requiredRoles) {
      return true;
    }

    // Obter o utilizador do request (anexado pelo JwtStrategy)
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    // Verificar se o utilizador tem um dos papéis requeridos
    return requiredRoles.some((role) => user.papel === role);
  }
}
