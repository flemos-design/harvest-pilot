import { IaService } from './ia.service';

describe('IaService notifications', () => {
  function createService() {
    const prisma = {
      utilizador: { findMany: jest.fn().mockResolvedValue([{ id: 'user-1' }]) },
      notificacao: { findFirst: jest.fn() },
    };
    const notifications = { createForUser: jest.fn().mockResolvedValue({ id: 'notification-1' }) };
    const service = new IaService(prisma as any, {} as any, notifications as any);
    return { prisma, notifications, service };
  }

  it('classifica a origem do insight e cria uma notificação apenas uma vez', async () => {
    const { prisma, notifications, service } = createService();
    prisma.notificacao.findFirst.mockResolvedValue(null);

    await (service as any).createNotificationsFromInsights([
      {
        source: 'METEO',
        type: 'alert',
        title: 'Risco meteorológico',
        description: 'Vento forte previsto',
        parcelaIds: ['parcela-1'],
        priority: 4,
      },
    ], 'org-1');

    expect(notifications.createForUser).toHaveBeenCalledWith('user-1', expect.objectContaining({
      tipo: 'METEO',
      link: '/parcelas/parcela-1',
    }));
  });

  it('não duplica uma notificação igual criada nas últimas 24 horas', async () => {
    const { prisma, notifications, service } = createService();
    prisma.notificacao.findFirst.mockResolvedValue({ id: 'existing' });

    await (service as any).createNotificationsFromInsights([
      {
        source: 'NDVI',
        type: 'warning',
        title: 'Queda de vigor',
        description: 'NDVI caiu 20%',
        parcelaIds: ['parcela-1'],
        priority: 3,
      },
    ], 'org-1');

    expect(notifications.createForUser).not.toHaveBeenCalled();
  });
});
