import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';

// Feature modules
import { PropriedadesModule } from './modules/propriedades/propriedades.module';
import { ParcelasModule } from './modules/parcelas/parcelas.module';
import { OperacoesModule } from './modules/operacoes/operacoes.module';
import { CulturasModule } from './modules/culturas/culturas.module';
import { CiclosModule } from './modules/ciclos/ciclos.module';
import { ImagensRemotasModule } from './modules/imagens-remotas/imagens-remotas.module';
import { MeteorologiaModule } from './modules/meteorologia/meteorologia.module';
import { InsumosModule } from './modules/insumos/insumos.module';
import { TarefasModule } from './modules/tarefas/tarefas.module';
import { OrganizacoesModule } from './modules/organizacoes/organizacoes.module';
import { CalendarioModule } from './modules/calendario/calendario.module';
import { UtilizadoresModule } from './modules/utilizadores/utilizadores.module';
import { EmailModule } from './modules/email/email.module';
import { IaModule } from './modules/ia/ia.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Event emitter
    EventEmitterModule.forRoot(),

    // Prisma ORM
    PrismaModule,

    // Feature modules
    EmailModule,
    OrganizacoesModule,
    UtilizadoresModule,
    PropriedadesModule,
    ParcelasModule,
    OperacoesModule,
    CulturasModule,
    CiclosModule,
    ImagensRemotasModule,
    MeteorologiaModule,
    InsumosModule,
    TarefasModule,
    CalendarioModule,
    IaModule,
    // SateliteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
