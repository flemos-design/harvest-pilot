import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Script para criar utilizador Admin BO em PRODUÇÃO
 * Executar apenas em produção via Railway CLI:
 *
 * railway run npx ts-node src/scripts/create-admin-bo.ts
 */
async function main() {
  console.log('🔐 Criando utilizador Admin Backoffice para produção...\n');

  // Dados do admin BO
  const adminData = {
    email: 'bo@harvestpilot.com',
    nome: 'Admin Backoffice',
    papel: 'ADMIN',
    password: '#Mdk2477FL2025!', // Será encriptada com bcrypt
  };

  // 1. Verificar se já existe
  const existing = await prisma.utilizador.findUnique({
    where: { email: adminData.email },
  });

  if (existing) {
    console.log(`⚠️  Utilizador ${adminData.email} já existe!`);
    console.log(`   ID: ${existing.id}`);
    console.log(`   Nome: ${existing.nome}`);
    console.log(`   Papel: ${existing.papel}`);
    console.log(`   Criado em: ${existing.createdAt}`);
    console.log('\n💡 Se quiseres atualizar a password, elimina primeiro o utilizador existente.');
    process.exit(0);
  }

  // 2. Obter ou criar organização "HarvestPilot Admin"
  let organizacao = await prisma.organizacao.findFirst({
    where: { slug: 'harvestpilot-admin' },
  });

  if (!organizacao) {
    console.log('📦 A criar organização "HarvestPilot Admin"...');
    organizacao = await prisma.organizacao.create({
      data: {
        nome: 'HarvestPilot Admin',
        slug: 'harvestpilot-admin',
      },
    });
    console.log(`✅ Organização criada (ID: ${organizacao.id})\n`);
  } else {
    console.log(`✅ Organização encontrada (ID: ${organizacao.id})\n`);
  }

  // 3. Encriptar password com bcrypt (10 rounds)
  console.log('🔒 A encriptar password com bcrypt...');
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(adminData.password, saltRounds);
  console.log(`✅ Password encriptada (${passwordHash.substring(0, 20)}...)\n`);

  // 4. Criar utilizador admin
  const admin = await prisma.utilizador.create({
    data: {
      email: adminData.email,
      nome: adminData.nome,
      papel: adminData.papel,
      passwordHash,
      organizacaoId: organizacao.id,
    },
  });

  console.log('🎉 Utilizador Admin BO criado com sucesso!\n');
  console.log('📋 Credenciais de acesso:');
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Password: ${adminData.password}`);
  console.log(`   Papel:    ${admin.papel}`);
  console.log(`   ID:       ${admin.id}`);
  console.log(`   Criado:   ${admin.createdAt}`);
  console.log('\n⚠️  IMPORTANTE: Guarda estas credenciais num local seguro!');
  console.log('⚠️  A password está encriptada na base de dados com bcrypt.');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar admin BO:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
