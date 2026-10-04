import { UtilizadoresController } from './utilizadores.controller';
import { PapelUtilizador } from './dto/create-utilizador.dto';

describe('UtilizadoresController', () => {
  it('cria o primeiro utilizador como administrador sem aceitar tenant público', async () => {
    const service = { create: jest.fn().mockResolvedValue({ id: 'user-1' }) };
    const controller = new UtilizadoresController(service as any);

    await controller.create({
      nome: 'Admin',
      email: 'admin@example.com',
      password: 'password',
      papel: PapelUtilizador.OPERADOR,
      organizacaoId: 'outra-organizacao',
    }, undefined);

    expect(service.create).toHaveBeenCalledWith({
      nome: 'Admin',
      email: 'admin@example.com',
      password: 'password',
      papel: PapelUtilizador.ADMIN,
      organizacaoId: undefined,
    });
  });

  it('preserva o DTO quando a criação é feita por um utilizador autenticado', async () => {
    const service = { create: jest.fn().mockResolvedValue({ id: 'user-2' }) };
    const controller = new UtilizadoresController(service as any);
    const dto = {
      nome: 'Operador',
      email: 'operador@example.com',
      password: 'password',
      papel: PapelUtilizador.OPERADOR,
      organizacaoId: 'org-1',
    };

    await controller.create(dto, { id: 'admin-1', organizacaoId: 'org-1', papel: PapelUtilizador.ADMIN } as any);

    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('encaminha /me para o utilizador autenticado', async () => {
    const service = { findOne: jest.fn().mockResolvedValue({ id: 'user-1' }) };
    const controller = new UtilizadoresController(service as any);

    await controller.me({ id: 'user-1', organizacaoId: 'org-1', papel: PapelUtilizador.ADMIN } as any);

    expect(service.findOne).toHaveBeenCalledWith('user-1');
  });
});
