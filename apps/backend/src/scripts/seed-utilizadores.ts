import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inserindo dados de exemplo para Utilizadores...\n');

  // Obter a primeira organização (criada no seed de organizações)
  const organizacao = await prisma.organizacao.findFirst();

  if (!organizacao) {
    console.error('❌ Nenhuma organização encontrada. Execute o seed de organizações primeiro.');
    process.exit(1);
  }

  const saltRounds = 10;

  const utilizadores = [
    {
      email: 'admin@harvestpilot.com',
      nome: 'Admin HarvestPilot',
      papel: 'ADMIN',
      password: 'admin123',
    },
    {
      email: 'gestor@harvestpilot.com',
      nome: 'João Silva',
      papel: 'GESTOR',
      password: 'gestor123',
    },
    {
      email: 'planeador@harvestpilot.com',
      nome: 'Maria Santos',
      papel: 'PLANEADOR',
      password: 'planeador123',
    },
    {
      email: 'operador1@harvestpilot.com',
      nome: 'Pedro Costa',
      papel: 'OPERADOR',
      password: 'operador123',
    },
    {
      email: 'operador2@harvestpilot.com',
      nome: 'Ana Ferreira',
      papel: 'OPERADOR',
      password: 'operador123',
    },
    {
      email: 'operador3@harvestpilot.com',
      nome: 'Carlos Oliveira',
      papel: 'OPERADOR',
      password: 'operador123',
    },
  ];

  let count = 0;
  for (const user of utilizadores) {
    // Verificar se já existe
    const existing = await prisma.utilizador.findUnique({
      where: { email: user.email },
    });

    if (existing) {
      console.log(`⚠️  Utilizador ${user.email} já existe, a saltar...`);
      continue;
    }

    const passwordHash = await bcrypt.hash(user.password, saltRounds);

    await prisma.utilizador.create({
      data: {
        email: user.email,
        nome: user.nome,
        papel: user.papel,
        passwordHash,
        organizacaoId: organizacao.id,
      },
    });
    count++;

    const papelIcon = {
      ADMIN: '👑',
      GESTOR: '📊',
      PLANEADOR: '📅',
      OPERADOR: '👷',
    }[user.papel];

    console.log(`${papelIcon} ${count}. ${user.nome} (${user.papel}) - ${user.email}`);
    console.log(`   Password: ${user.password}`);
  }

  console.log(`\n🎉 Total de ${count} utilizadores inseridos com sucesso!`);

  // Stats
  const stats = await prisma.utilizador.groupBy({
    by: ['papel'],
    _count: true,
  });

  console.log('\n📊 Resumo por papel:');
  stats.forEach(s => {
    const icon = {
      ADMIN: '👑',
      GESTOR: '📊',
      PLANEADOR: '📅',
      OPERADOR: '👷',
    }[s.papel];
    console.log(`  ${icon} ${s.papel}: ${s._count}`);
  });

  console.log('\n📋 Credenciais de acesso:');
  console.log('  👑 Admin:     admin@harvestpilot.com / admin123');
  console.log('  📊 Gestor:    gestor@harvestpilot.com / gestor123');
  console.log('  📅 Planeador: planeador@harvestpilot.com / planeador123');
  console.log('  👷 Operador:  operador1@harvestpilot.com / operador123');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
