import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inserindo dados de exemplo para Meteorologia...\n');

  // Buscar parcelas existentes
  const parcelas = await prisma.parcela.findMany({
    take: 2,
    select: { id: true, nome: true },
  });

  if (parcelas.length === 0) {
    console.log('❌ Nenhuma parcela encontrada. Crie parcelas primeiro.');
    return;
  }

  console.log(`📍 Parcelas encontradas: ${parcelas.map(p => p.nome).join(', ')}\n`);

  const parcelaSul = parcelas[0];
  const parcelaNorte = parcelas[1];

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Função auxiliar para gerar dados meteorológicos realistas
  const gerarDadosMeteo = (diasOffset: number, parcelaId: string) => {
    const data = new Date(hoje);
    data.setDate(data.getDate() + diasOffset);

    // Temperatura base varia com os dias (simula tendência sazonal)
    const tempBase = 18 + Math.sin(diasOffset / 7) * 8;
    const tempVariacao = Math.random() * 6 - 3;
    const temperatura = tempBase + tempVariacao;

    // Temperaturas min/max baseadas na temperatura média
    const tempMin = temperatura - (3 + Math.random() * 3);
    const tempMax = temperatura + (3 + Math.random() * 5);

    // Precipitação (alguns dias sem, outros com)
    const temChuva = Math.random() > 0.7;
    const precipitacao = temChuva ? Math.random() * 25 : 0;
    const probChuva = temChuva ? 60 + Math.random() * 35 : Math.random() * 40;

    // Vento e humidade
    const vento = 5 + Math.random() * 25;
    const humidade = temChuva ? 65 + Math.random() * 25 : 40 + Math.random() * 30;

    return {
      parcelaId,
      data,
      fonte: 'IPMA',
      temperatura,
      tempMin,
      tempMax,
      precipitacao,
      probChuva,
      vento,
      humidade,
    };
  };

  let count = 0;

  // Inserir histórico (últimos 14 dias)
  console.log('📅 Inserindo histórico meteorológico (últimos 14 dias)...');
  for (let i = -14; i < 0; i++) {
    // Dados para Parcela Sul
    await prisma.meteoParcela.create({
      data: gerarDadosMeteo(i, parcelaSul.id),
    });
    count++;

    // Dados para Parcela Norte
    await prisma.meteoParcela.create({
      data: gerarDadosMeteo(i, parcelaNorte.id),
    });
    count++;
  }

  console.log(`✅ ${count} registos de histórico inseridos`);

  // Inserir previsão (próximos 10 dias)
  console.log('\n📅 Inserindo previsão meteorológica (próximos 10 dias)...');
  const countAntes = count;
  for (let i = 0; i <= 10; i++) {
    // Dados para Parcela Sul
    await prisma.meteoParcela.create({
      data: gerarDadosMeteo(i, parcelaSul.id),
    });
    count++;

    // Dados para Parcela Norte
    await prisma.meteoParcela.create({
      data: gerarDadosMeteo(i, parcelaNorte.id),
    });
    count++;
  }

  console.log(`✅ ${count - countAntes} registos de previsão inseridos`);

  console.log(`\n🎉 Total de ${count} registos meteorológicos inseridos com sucesso!`);

  // Mostrar resumo
  const totalRegistos = await prisma.meteoParcela.count();
  console.log(`\n📊 Total de registos meteorológicos no sistema: ${totalRegistos}`);

  // Mostrar alguns dados de exemplo
  console.log('\n📋 Exemplos de dados inseridos:');

  const hojeDados = await prisma.meteoParcela.findMany({
    where: {
      data: {
        gte: hoje,
        lt: new Date(hoje.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    include: {
      parcela: {
        select: { nome: true },
      },
    },
  });

  hojeDados.forEach((dado) => {
    console.log(
      `  ${dado.parcela.nome}: ${dado.temperatura?.toFixed(1)}°C, ` +
      `Precipitação: ${dado.precipitacao?.toFixed(1)}mm, ` +
      `Prob. Chuva: ${dado.probChuva?.toFixed(0)}%`
    );
  });

  const previsaoAmanha = await prisma.meteoParcela.findMany({
    where: {
      data: {
        gte: new Date(hoje.getTime() + 24 * 60 * 60 * 1000),
        lt: new Date(hoje.getTime() + 2 * 24 * 60 * 60 * 1000),
      },
    },
    include: {
      parcela: {
        select: { nome: true },
      },
    },
  });

  console.log('\n📋 Previsão para amanhã:');
  previsaoAmanha.forEach((dado) => {
    console.log(
      `  ${dado.parcela.nome}: ${dado.temperatura?.toFixed(1)}°C, ` +
      `Prob. Chuva: ${dado.probChuva?.toFixed(0)}%, ` +
      `Vento: ${dado.vento?.toFixed(1)} km/h`
    );
  });
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
