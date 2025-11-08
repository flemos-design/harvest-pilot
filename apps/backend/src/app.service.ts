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
      version: '1.0.0',
      description: 'Sistema de Gestão Agrícola com Satélite e Meteo',
      status: 'online',
      timestamp: new Date().toISOString(),
      endpoints: {
        documentation: '/api/docs',
        api: '/api/v1',
        health: '/health',
      },
      frontend: process.env.FRONTEND_URL || 'https://app.harvestpilot.online',
    };
  }
}
