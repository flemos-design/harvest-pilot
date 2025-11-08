import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inserindo dados de exemplo para Calendário Agrícola...\n');

  const regras = [
    // ========== CASTANHEIRO ==========
    {
      cultura: 'Castanheiro',
      variedade: 'Longal',
      finalidade: 'FRUTO',
      tipoOperacao: 'COLHEITA',
      regiao: 'Espinhosela',
      mesInicio: 9,
      mesFim: 10,
      tbase: 10,
      gddAlvo: 1200,
      ventoMax: 25,
      chuvaMax: 10,
      phiDias: 0,
      descricao: 'Colheita das castanhas quando os ouriços abrem naturalmente. Evitar dias de chuva forte.',
    },
    {
      cultura: 'Castanheiro',
      variedade: 'Judia',
      finalidade: 'FRUTO',
      tipoOperacao: 'COLHEITA',
      regiao: 'Espinhosela',
      mesInicio: 10,
      mesFim: 11,
      ventoMax: 20,
      chuvaMax: 15,
      descricao: 'Colheita mais tardia. Variedade de maior calibre e qualidade.',
    },
    {
      cultura: 'Castanheiro',
      finalidade: 'FRUTO',
      tipoOperacao: 'PODA',
      regiao: 'Espinhosela',
      mesInicio: 1,
      mesFim: 3,
      ventoMax: 30,
      descricao: 'Poda de inverno em período de dormência. Evitar geadas fortes.',
    },
    {
      cultura: 'Castanheiro',
      finalidade: 'FRUTO',
      tipoOperacao: 'ADUBACAO',
      regiao: 'Espinhosela',
      mesInicio: 3,
      mesFim: 4,
      chuvaMax: 5,
      descricao: 'Adubação de primavera antes da floração. Preferir dias secos.',
    },
    {
      cultura: 'Castanheiro',
      finalidade: 'FRUTO',
      tipoOperacao: 'TRATAMENTO',
      regiao: 'Espinhosela',
      mesInicio: 5,
      mesFim: 6,
      ventoMax: 15,
      chuvaMax: 0,
      phiDias: 14,
      descricao: 'Tratamento contra vespa das galhas e cancro do castanheiro.',
    },

    // ========== CEREJEIRA ==========
    {
      cultura: 'Cerejeira',
      variedade: 'Burlat',
      finalidade: 'FRUTO',
      tipoOperacao: 'COLHEITA',
      regiao: 'Espinhosela',
      mesInicio: 5,
      mesFim: 6,
      tbase: 7,
      gddAlvo: 800,
      ventoMax: 20,
      chuvaMax: 2,
      phiDias: 0,
      descricao: 'Colheita precoce. Evitar dias de chuva para prevenir rachamento dos frutos.',
    },
    {
      cultura: 'Cerejeira',
      variedade: 'Summit',
      finalidade: 'FRUTO',
      tipoOperacao: 'COLHEITA',
      regiao: 'Espinhosela',
      mesInicio: 6,
      mesFim: 7,
      tbase: 7,
      gddAlvo: 900,
      ventoMax: 20,
      chuvaMax: 2,
      descricao: 'Variedade média-tardia. Frutos de grande calibre.',
    },
    {
      cultura: 'Cerejeira',
      finalidade: 'FRUTO',
      tipoOperacao: 'PODA',
      regiao: 'Espinhosela',
      mesInicio: 7,
      mesFim: 8,
      ventoMax: 25,
      descricao: 'Poda de verão após colheita para controlar vigor e facilitar cicatrização.',
    },
    {
      cultura: 'Cerejeira',
      finalidade: 'FRUTO',
      tipoOperacao: 'TRATAMENTO',
      regiao: 'Espinhosela',
      mesInicio: 3,
      mesFim: 5,
      ventoMax: 15,
      chuvaMax: 0,
      phiDias: 21,
      descricao: 'Tratamento contra mosca da cereja e monilínia.',
    },

    // ========== NOGUEIRA ==========
    {
      cultura: 'Nogueira',
      variedade: 'Chandler',
      finalidade: 'FRUTO',
      tipoOperacao: 'COLHEITA',
      regiao: 'Espinhosela',
      mesInicio: 9,
      mesFim: 10,
      ventoMax: 30,
      chuvaMax: 15,
      descricao: 'Colheita quando as cápsulas abrem. Variedade de elevada produtividade.',
    },
    {
      cultura: 'Nogueira',
      finalidade: 'FRUTO',
      tipoOperacao: 'PODA',
      regiao: 'Espinhosela',
      mesInicio: 12,
      mesFim: 2,
      ventoMax: 35,
      descricao: 'Poda de inverno em repouso vegetativo. Evitar período de geadas intensas.',
    },
    {
      cultura: 'Nogueira',
      finalidade: 'FRUTO',
      tipoOperacao: 'REGA',
      regiao: 'Espinhosela',
      mesInicio: 6,
      mesFim: 8,
      descricao: 'Rega regular durante o desenvolvimento dos frutos. Período crítico.',
    },
    {
      cultura: 'Nogueira',
      finalidade: 'FRUTO',
      tipoOperacao: 'ADUBACAO',
      regiao: 'Espinhosela',
      mesInicio: 3,
      mesFim: 4,
      chuvaMax: 5,
      descricao: 'Adubação primaveril. Aplicar antes da rebentação.',
    },

    // ========== AMENDOEIRA ==========
    {
      cultura: 'Amendoeira',
      finalidade: 'FRUTO',
      tipoOperacao: 'COLHEITA',
      regiao: 'Espinhosela',
      mesInicio: 8,
      mesFim: 9,
      ventoMax: 25,
      chuvaMax: 10,
      descricao: 'Colheita quando as cápsulas secam e abrem.',
    },
    {
      cultura: 'Amendoeira',
      finalidade: 'FRUTO',
      tipoOperacao: 'PODA',
      regiao: 'Espinhosela',
      mesInicio: 2,
      mesFim: 3,
      ventoMax: 30,
      descricao: 'Poda de formação e limpeza antes da floração.',
    },
    {
      cultura: 'Amendoeira',
      finalidade: 'FRUTO',
      tipoOperacao: 'TRATAMENTO',
      regiao: 'Espinhosela',
      mesInicio: 3,
      mesFim: 5,
      ventoMax: 15,
      chuvaMax: 0,
      phiDias: 14,
      descricao: 'Tratamento contra monilínia e crivado.',
    },

    // ========== OLIVEIRA ==========
    {
      cultura: 'Oliveira',
      variedade: 'Cobrançosa',
      finalidade: 'FRUTO',
      tipoOperacao: 'COLHEITA',
      regiao: 'Espinhosela',
      mesInicio: 11,
      mesFim: 1,
      ventoMax: 20,
      chuvaMax: 15,
      descricao: 'Colheita para azeite de qualidade superior. Azeitona em fase de pintor.',
    },
    {
      cultura: 'Oliveira',
      finalidade: 'FRUTO',
      tipoOperacao: 'PODA',
      regiao: 'Espinhosela',
      mesInicio: 2,
      mesFim: 4,
      ventoMax: 30,
      descricao: 'Poda de frutificação e arejamento. Evitar período de geadas.',
    },
    {
      cultura: 'Oliveira',
      finalidade: 'FRUTO',
      tipoOperacao: 'TRATAMENTO',
      regiao: 'Espinhosela',
      mesInicio: 5,
      mesFim: 7,
      ventoMax: 15,
      chuvaMax: 0,
      phiDias: 21,
      descricao: 'Tratamento contra mosca da azeitona e repilo.',
    },

    // ========== MACIEIRA ==========
    {
      cultura: 'Macieira',
      variedade: 'Golden Delicious',
      finalidade: 'FRUTO',
      tipoOperacao: 'COLHEITA',
      regiao: 'Espinhosela',
      mesInicio: 9,
      mesFim: 10,
      tbase: 6,
      gddAlvo: 1400,
      ventoMax: 25,
      chuvaMax: 10,
      descricao: 'Colheita quando os frutos atingem o grau de maturação adequado.',
    },
    {
      cultura: 'Macieira',
      finalidade: 'FRUTO',
      tipoOperacao: 'PODA',
      regiao: 'Espinhosela',
      mesInicio: 12,
      mesFim: 2,
      ventoMax: 30,
      descricao: 'Poda de inverno para frutificação.',
    },
    {
      cultura: 'Macieira',
      finalidade: 'FRUTO',
      tipoOperacao: 'DESBASTE',
      regiao: 'Espinhosela',
      mesInicio: 5,
      mesFim: 6,
      descricao: 'Desbaste de frutos para melhorar calibre e qualidade.',
    },
    {
      cultura: 'Macieira',
      finalidade: 'FRUTO',
      tipoOperacao: 'TRATAMENTO',
      regiao: 'Espinhosela',
      mesInicio: 4,
      mesFim: 8,
      ventoMax: 15,
      chuvaMax: 0,
      phiDias: 14,
      descricao: 'Programa de tratamentos contra carpocapsa, oídio e pedrado.',
    },

    // ========== VIDEIRA ==========
    {
      cultura: 'Videira',
      finalidade: 'FRUTO',
      tipoOperacao: 'COLHEITA',
      regiao: 'Espinhosela',
      mesInicio: 9,
      mesFim: 10,
      tbase: 10,
      gddAlvo: 1000,
      ventoMax: 20,
      chuvaMax: 5,
      descricao: 'Vindima quando as uvas atingem o grau de açúcar adequado.',
    },
    {
      cultura: 'Videira',
      finalidade: 'FRUTO',
      tipoOperacao: 'PODA',
      regiao: 'Espinhosela',
      mesInicio: 12,
      mesFim: 3,
      ventoMax: 35,
      descricao: 'Poda de inverno para controlo de produção e qualidade.',
    },
    {
      cultura: 'Videira',
      finalidade: 'FRUTO',
      tipoOperacao: 'TRATAMENTO',
      regiao: 'Espinhosela',
      mesInicio: 5,
      mesFim: 8,
      ventoMax: 15,
      chuvaMax: 0,
      phiDias: 28,
      descricao: 'Tratamentos contra míldio, oídio e podridão cinzenta.',
    },

    // ========== PESSEGUEIRO ==========
    {
      cultura: 'Pessegueiro',
      finalidade: 'FRUTO',
      tipoOperacao: 'COLHEITA',
      regiao: 'Espinhosela',
      mesInicio: 6,
      mesFim: 8,
      tbase: 7,
      gddAlvo: 900,
      ventoMax: 20,
      chuvaMax: 5,
      descricao: 'Colheita escalonada conforme variedades. Frutos delicados.',
    },
    {
      cultura: 'Pessegueiro',
      finalidade: 'FRUTO',
      tipoOperacao: 'PODA',
      regiao: 'Espinhosela',
      mesInicio: 1,
      mesFim: 2,
      ventoMax: 30,
      descricao: 'Poda de frutificação. Renovação de ramos produtivos.',
    },
  ];

  let count = 0;
  for (const regra of regras) {
    await prisma.calendarioRegra.create({ data: regra });
    count++;

    // Determinar se atravessa o ano
    const atravessaAno = regra.mesInicio > regra.mesFim;
    const periodoIcon = atravessaAno ? '🔄' : '📅';

    // Mostrar meses
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const periodo = `${meses[regra.mesInicio - 1]}-${meses[regra.mesFim - 1]}`;

    // Ícone por tipo de operação
    const tipoIcon = {
      COLHEITA: '🌾',
      PODA: '✂️',
      TRATAMENTO: '🧪',
      REGA: '💧',
      ADUBACAO: '🌱',
      PLANTACAO: '🌳',
      INSPECAO: '🔍',
      DESBASTE: '🍃',
    }[regra.tipoOperacao] || '📋';

    const variedadeInfo = regra.variedade ? ` (${regra.variedade})` : '';
    console.log(`${tipoIcon} ${periodoIcon} ${count}. ${regra.cultura}${variedadeInfo} - ${regra.tipoOperacao} [${periodo}]`);
  }

  console.log(`\n🎉 Total de ${count} regras de calendário inseridas com sucesso!`);

  // Stats
  const stats = await prisma.calendarioRegra.groupBy({
    by: ['cultura'],
    _count: true,
  });

  console.log('\n📊 Resumo por cultura:');
  stats.forEach(s => {
    console.log(`  🌿 ${s.cultura}: ${s._count} regras`);
  });

  const statsTipo = await prisma.calendarioRegra.groupBy({
    by: ['tipoOperacao'],
    _count: true,
  });

  console.log('\n📊 Resumo por tipo de operação:');
  statsTipo.forEach(s => {
    const icon = {
      COLHEITA: '🌾',
      PODA: '✂️',
      TRATAMENTO: '🧪',
      REGA: '💧',
      ADUBACAO: '🌱',
      PLANTACAO: '🌳',
      INSPECAO: '🔍',
      DESBASTE: '🍃',
    }[s.tipoOperacao] || '📋';
    console.log(`  ${icon} ${s.tipoOperacao}: ${s._count} regras`);
  });

  // Regras que atravessam o ano
  const atravessaAno = await prisma.calendarioRegra.findMany({
    where: {
      mesInicio: { gt: prisma.calendarioRegra.fields.mesFim },
    },
  });

  console.log('\n🔄 Regras que atravessam o ano (ex: Nov-Mar):');
  const regrasAnuais = regras.filter(r => r.mesInicio > r.mesFim);
  regrasAnuais.forEach(r => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const periodo = `${meses[r.mesInicio - 1]}-${meses[r.mesFim - 1]}`;
    console.log(`  - ${r.cultura} - ${r.tipoOperacao} [${periodo}]`);
  });

  // Mês atual
  const mesAtual = new Date().getMonth() + 1;
  const mesesNome = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const regrasAtivas = regras.filter((regra) => {
    if (regra.mesInicio <= regra.mesFim) {
      return mesAtual >= regra.mesInicio && mesAtual <= regra.mesFim;
    } else {
      return mesAtual >= regra.mesInicio || mesAtual <= regra.mesFim;
    }
  });

  console.log(`\n📆 Regras ativas para ${mesesNome[mesAtual - 1]} (mês ${mesAtual}):`);
  if (regrasAtivas.length > 0) {
    regrasAtivas.forEach(r => {
      const icon = {
        COLHEITA: '🌾',
        PODA: '✂️',
        TRATAMENTO: '🧪',
        REGA: '💧',
        ADUBACAO: '🌱',
        PLANTACAO: '🌳',
        INSPECAO: '🔍',
        DESBASTE: '🍃',
      }[r.tipoOperacao] || '📋';
      console.log(`  ${icon} ${r.cultura} - ${r.tipoOperacao}`);
    });
  } else {
    console.log('  Nenhuma regra ativa para este mês');
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
