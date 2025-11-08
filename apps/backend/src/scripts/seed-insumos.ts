import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inserindo dados de exemplo para Insumos...\n');

  const insumos = [
    // Fertilizantes
    { nome: 'Adubo NPK 15-15-15', categoria: 'FERTILIZANTE', unidade: 'kg', stock: 250, stockMinimo: 50, custoUnit: 1.5, lote: 'NPK2024-001', validade: new Date('2025-12-31') },
    { nome: 'Ureia 46%', categoria: 'FERTILIZANTE', unidade: 'kg', stock: 180, stockMinimo: 100, custoUnit: 0.8, lote: 'URE2024-002', validade: new Date('2026-06-30') },
    { nome: 'Superfosfato Triplo', categoria: 'FERTILIZANTE', unidade: 'kg', stock: 45, stockMinimo: 50, custoUnit: 1.2, lote: 'SFT2024-003', validade: new Date('2025-09-30') },
    { nome: 'Cloreto de Potássio', categoria: 'FERTILIZANTE', unidade: 'kg', stock: 120, stockMinimo: 40, custoUnit: 0.9, lote: 'KCL2024-004' },

    // Fitofármacos
    { nome: 'Glifosato 480g/L', categoria: 'FITOFARMACO', unidade: 'L', stock: 15, stockMinimo: 10, custoUnit: 12.5, lote: 'GLI2024-101', validade: new Date('2025-03-31') },
    { nome: 'Fungicida Cobre', categoria: 'FITOFARMACO', unidade: 'kg', stock: 8, stockMinimo: 5, custoUnit: 18.0, lote: 'FUN2024-102', validade: new Date('2025-08-15') },
    { nome: 'Inseticida Lambda', categoria: 'FITOFARMACO', unidade: 'L', stock: 3, stockMinimo: 5, custoUnit: 25.0, lote: 'INS2024-103', validade: new Date('2024-12-31') },

    // Sementes
    { nome: 'Semente Castanheiro Hibrido', categoria: 'SEMENTE', unidade: 'unidade', stock: 500, stockMinimo: 100, custoUnit: 3.5, lote: 'CAS2024-201' },
    { nome: 'Semente Cerejeira Burlat', categoria: 'SEMENTE', unidade: 'unidade', stock: 200, stockMinimo: 50, custoUnit: 4.2, lote: 'CER2024-202' },
    { nome: 'Semente Nogueira', categoria: 'SEMENTE', unidade: 'unidade', stock: 150, stockMinimo: 80, custoUnit: 3.8, lote: 'NOG2024-203' },

    // Outros
    { nome: 'Fita de Rega Gota-a-Gota', categoria: 'OUTRO', unidade: 'm', stock: 1000, stockMinimo: 200, custoUnit: 0.5, lote: 'FRG2024-301' },
    { nome: 'Tutores Bambu 1.5m', categoria: 'OUTRO', unidade: 'unidade', stock: 80, stockMinimo: 100, custoUnit: 0.8, lote: 'TUT2024-302' },
  ];

  let count = 0;
  for (const insumo of insumos) {
    await prisma.insumo.create({ data: insumo });
    count++;
    console.log(`✅ ${count}. ${insumo.nome} (${insumo.stock} ${insumo.unidade})`);
  }

  console.log(`\n🎉 Total de ${count} insumos inseridos com sucesso!`);

  // Stats
  const stats = await prisma.insumo.groupBy({
    by: ['categoria'],
    _count: true,
    _sum: { stock: true },
  });

  console.log('\n📊 Resumo por categoria:');
  stats.forEach(s => {
    console.log(`  ${s.categoria}: ${s._count} items, Stock total: ${s._sum.stock}`);
  });

  // Alertas
  const lowStock = await prisma.insumo.findMany({
    where: { stockMinimo: { not: null } },
  });
  const alertas = lowStock.filter(i => i.stock <= (i.stockMinimo || 0));

  if (alertas.length > 0) {
    console.log(`\n⚠️  ${alertas.length} insumos com stock baixo:`);
    alertas.forEach(a => {
      console.log(`  - ${a.nome}: ${a.stock}/${a.stockMinimo} ${a.unidade}`);
    });
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
