import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Criar organização de exemplo
  const org = await prisma.organizacao.upsert({
    where: { slug: 'espinhosela-demo' },
    update: {},
    create: {
      nome: 'Quinta de Espinhosela',
      slug: 'espinhosela-demo',
    },
  });

  console.log('✅ Organização criada:', org.nome);

  // Criar utilizador admin
  const admin = await prisma.utilizador.upsert({
    where: { email: 'admin@harvestpilot.pt' },
    update: {},
    create: {
      email: 'admin@harvestpilot.pt',
      nome: 'Administrador',
      passwordHash: '$2b$10$DEMO.HASH.NOT.FOR.PRODUCTION',
      papel: 'ADMIN',
      organizacaoId: org.id,
    },
  });

  console.log('✅ Utilizador admin criado:', admin.email);

  // Criar propriedade de exemplo
  const propriedade = await prisma.propriedade.create({
    data: {
      nome: 'Propriedade Principal',
      descricao: 'Propriedade agrícola em Espinhosela',
      organizacaoId: org.id,
    },
  });

  console.log('✅ Propriedade criada:', propriedade.nome);

  // Criar parcelas de exemplo
  const parcela1 = await prisma.parcela.create({
    data: {
      nome: 'Parcela Norte - Castanheiro',
      area: 2.5,
      altitude: 900,
      tipoSolo: 'Franco-arenoso',
      geometria: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [-6.7500, 41.7900],
            [-6.7480, 41.7900],
            [-6.7480, 41.7920],
            [-6.7500, 41.7920],
            [-6.7500, 41.7900],
          ],
        ],
      }),
      propriedadeId: propriedade.id,
    },
  });

  const parcela2 = await prisma.parcela.create({
    data: {
      nome: 'Parcela Sul - Cerejeira',
      area: 1.8,
      altitude: 880,
      tipoSolo: 'Franco-argiloso',
      geometria: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [-6.7520, 41.7880],
            [-6.7500, 41.7880],
            [-6.7500, 41.7900],
            [-6.7520, 41.7900],
            [-6.7520, 41.7880],
          ],
        ],
      }),
      propriedadeId: propriedade.id,
    },
  });

  console.log('✅ Parcelas criadas:', parcela1.nome, 'e', parcela2.nome);

  // Criar culturas
  const cultura1 = await prisma.cultura.create({
    data: {
      especie: 'Castanheiro',
      variedade: 'Judia',
      finalidade: 'FRUTO',
      parcelaId: parcela1.id,
    },
  });

  const cultura2 = await prisma.cultura.create({
    data: {
      especie: 'Cerejeira',
      variedade: 'Saco',
      finalidade: 'FRUTO',
      parcelaId: parcela2.id,
    },
  });

  console.log('✅ Culturas criadas');

  // Criar regras de calendário
  const regra1 = await prisma.calendarioRegra.create({
    data: {
      cultura: 'Castanheiro',
      finalidade: 'FRUTO',
      tipoOperacao: 'PLANTACAO',
      regiao: 'Espinhosela',
      mesInicio: 11, // Novembro
      mesFim: 2, // Fevereiro
      tbase: 10,
      ventoMax: 30,
      descricao: 'Plantação de castanheiro durante o repouso vegetativo',
    },
  });

  const regra2 = await prisma.calendarioRegra.create({
    data: {
      cultura: 'Castanheiro',
      finalidade: 'FRUTO',
      tipoOperacao: 'COLHEITA',
      regiao: 'Espinhosela',
      mesInicio: 10, // Outubro
      mesFim: 11, // Novembro
      chuvaMax: 5,
      descricao: 'Colheita de castanha quando >50% ouriços abertos',
    },
  });

  const regra3 = await prisma.calendarioRegra.create({
    data: {
      cultura: 'Cerejeira',
      finalidade: 'FRUTO',
      tipoOperacao: 'COLHEITA',
      regiao: 'Espinhosela',
      mesInicio: 6, // Junho
      mesFim: 7, // Julho
      chuvaMax: 2,
      ventoMax: 25,
      descricao: 'Colheita de cereja em tempo seco para evitar rachamento',
    },
  });

  console.log('✅ Regras de calendário criadas');

  console.log('');
  console.log('🎉 Seed concluído com sucesso!');
  console.log('');
  console.log('📊 Dados criados:');
  console.log('   - 1 Organização');
  console.log('   - 1 Utilizador (admin@harvestpilot.pt)');
  console.log('   - 1 Propriedade');
  console.log('   - 2 Parcelas');
  console.log('   - 2 Culturas');
  console.log('   - 3 Regras de calendário');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
