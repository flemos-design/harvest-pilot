import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../common/prisma/prisma.service';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  papel: string;
  organizacaoId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'harvestpilot-secret-change-in-production',
    });
  }

  async validate(payload: JwtPayload) {
    // Verificar se o utilizador ainda existe
    const utilizador = await this.prisma.utilizador.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        nome: true,
        papel: true,
        organizacaoId: true,
        organizacao: {
          select: {
            id: true,
            nome: true,
            slug: true,
          },
        },
      },
    });

    if (!utilizador) {
      throw new UnauthorizedException('Utilizador não encontrado');
    }

    // O objecto retornado aqui será anexado ao request como request.user
    return utilizador;
  }
}
