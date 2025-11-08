import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Limpando imagens remotas...\n');

  const result = await prisma.imagemRemota.deleteMany({});

  console.log(`✅ ${result.count} imagens remotas removidas com sucesso!`);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
