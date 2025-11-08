import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  getInfo() {
    return {
      name: 'HarvestPilot API',
      version: '0.1.0',
      description: 'Plataforma de Gestão de Parcelas & Calendário Agrícola',
      docs: '/api/docs',
      health: '/api/v1/health',
    };
  }
}
