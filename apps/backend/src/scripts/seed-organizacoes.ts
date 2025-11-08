import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inserindo dados de exemplo para Organizações...\n');

  const organizacoes = [
    {
      nome: 'Quinta do Vale Verde',
      slug: 'quinta-vale-verde',
    },
    {
      nome: 'Cooperativa Agrícola do Douro',
      slug: 'cooperativa-douro',
    },
    {
      nome: 'Herdade São Miguel',
      slug: 'herdade-sao-miguel',
    },
    {
      nome: 'Agro Trás-os-Montes',
      slug: 'agro-tras-os-montes',
    },
    {
      nome: 'Quinta da Serra Alentejana',
      slug: 'quinta-serra-alentejana',
    },
  ];

  let count = 0;
  for (const org of organizacoes) {
    const created = await prisma.organizacao.create({
      data: org,
      include: {
        _count: {
          select: {
            propriedades: true,
            utilizadores: true,
          },
        },
      },
    });
    count++;
    console.log(`✅ ${count}. ${created.nome} (@${created.slug})`);
  }

  console.log(`\n🎉 Total de ${count} organizações inseridas com sucesso!`);

  // Stats
  const stats = await prisma.organizacao.findMany({
    include: {
      _count: {
        select: {
          propriedades: true,
          utilizadores: true,
        },
      },
    },
  });

  console.log('\n📊 Resumo:');
  stats.forEach((org) => {
    console.log(
      `  ${org.nome}: ${org._count.propriedades} propriedades, ${org._count.utilizadores} utilizadores`,
    );
  });

  // Totais
  const [totalPropriedades, totalUtilizadores] = await Promise.all([
    prisma.propriedade.count(),
    prisma.utilizador.count(),
  ]);

  console.log('\n📈 Totais globais:');
  console.log(`  Total de propriedades: ${totalPropriedades}`);
  console.log(`  Total de utilizadores: ${totalUtilizadores}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
