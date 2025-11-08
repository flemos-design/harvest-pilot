import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inserindo dados de exemplo para Imagens Remotas...\n');

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

  // Imagens para Parcela Sul (evolução temporal)
  // Usando imagens placeholder de agricultura/campos para demonstração
  const imagensSul = [
    {
      parcelaId: parcelaSul.id,
      data: new Date('2024-08-15'),
      fonte: 'SENTINEL-2',
      nuvens: 5.2,
      ndvi: 0.45,
      ndre: 0.38,
      evi: 0.42,
      urlImagem: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
      metadados: { resolution: '10m', bands: ['B4', 'B8', 'B5'] },
    },
    {
      parcelaId: parcelaSul.id,
      data: new Date('2024-09-10'),
      fonte: 'SENTINEL-2',
      nuvens: 15.8,
      ndvi: 0.62,
      ndre: 0.55,
      evi: 0.65,
      urlImagem: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop',
      metadados: { resolution: '10m', bands: ['B4', 'B8', 'B5'] },
    },
    {
      parcelaId: parcelaSul.id,
      data: new Date('2024-10-05'),
      fonte: 'SENTINEL-2',
      nuvens: 8.3,
      ndvi: 0.73,
      ndre: 0.68,
      evi: 0.75,
      urlImagem: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop',
      metadados: { resolution: '10m', bands: ['B4', 'B8', 'B5'] },
    },
    {
      parcelaId: parcelaSul.id,
      data: new Date('2024-11-01'),
      fonte: 'SENTINEL-2',
      nuvens: 42.5,
      ndvi: 0.68,
      ndre: 0.62,
      evi: 0.70,
      urlImagem: 'https://images.unsplash.com/photo-1566281796817-93bc94d7dbd2?w=800&h=600&fit=crop',
      metadados: { resolution: '10m', bands: ['B4', 'B8', 'B5'], note: 'Alta cobertura de nuvens' },
    },
    {
      parcelaId: parcelaSul.id,
      data: new Date('2024-11-07'),
      fonte: 'SENTINEL-2',
      nuvens: 12.1,
      ndvi: 0.71,
      ndre: 0.65,
      evi: 0.73,
      urlImagem: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop',
      metadados: { resolution: '10m', bands: ['B4', 'B8', 'B5'] },
    },
  ];

  // Imagens para Parcela Norte
  const imagensNorte = [
    {
      parcelaId: parcelaNorte.id,
      data: new Date('2024-08-20'),
      fonte: 'SENTINEL-2',
      nuvens: 12.0,
      ndvi: 0.52,
      ndre: 0.45,
      evi: 0.50,
      urlImagem: 'https://images.unsplash.com/photo-1589922034137-d2c80fc7238e?w=800&h=600&fit=crop',
      metadados: { resolution: '10m', bands: ['B4', 'B8', 'B5'] },
    },
    {
      parcelaId: parcelaNorte.id,
      data: new Date('2024-09-15'),
      fonte: 'SENTINEL-2',
      nuvens: 7.5,
      ndvi: 0.68,
      ndre: 0.60,
      evi: 0.70,
      urlImagem: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=600&fit=crop',
      metadados: { resolution: '10m', bands: ['B4', 'B8', 'B5'] },
    },
    {
      parcelaId: parcelaNorte.id,
      data: new Date('2024-10-18'),
      fonte: 'SENTINEL-2',
      nuvens: 3.2,
      ndvi: 0.78,
      ndre: 0.72,
      evi: 0.81,
      urlImagem: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&h=600&fit=crop',
      metadados: { resolution: '10m', bands: ['B4', 'B8', 'B5'], note: 'Excelente qualidade' },
    },
    {
      parcelaId: parcelaNorte.id,
      data: new Date('2024-11-05'),
      fonte: 'SENTINEL-2',
      nuvens: 18.7,
      ndvi: 0.75,
      ndre: 0.69,
      evi: 0.78,
      urlImagem: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop',
      metadados: { resolution: '10m', bands: ['B4', 'B8', 'B5'] },
    },
  ];

  // Inserir imagens
  let count = 0;

  for (const imagem of [...imagensSul, ...imagensNorte]) {
    await prisma.imagemRemota.create({
      data: imagem,
    });
    count++;
    console.log(`✅ Imagem ${count}: ${imagem.data.toISOString().split('T')[0]} - NDVI: ${imagem.ndvi}`);
  }

  console.log(`\n🎉 Total de ${count} imagens remotas inseridas com sucesso!`);

  // Mostrar resumo
  const totalImagens = await prisma.imagemRemota.count();
  console.log(`\n📊 Total de imagens no sistema: ${totalImagens}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
