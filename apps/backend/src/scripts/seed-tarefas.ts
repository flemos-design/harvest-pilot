import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inserindo dados de exemplo para Tarefas...\n');

  // Datas relativas para criar tarefas realistas
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  const em3Dias = new Date(hoje);
  em3Dias.setDate(em3Dias.getDate() + 3);
  const em5Dias = new Date(hoje);
  em5Dias.setDate(em5Dias.getDate() + 5);
  const em7Dias = new Date(hoje);
  em7Dias.setDate(em7Dias.getDate() + 7);
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  const ha3Dias = new Date(hoje);
  ha3Dias.setDate(ha3Dias.getDate() - 3);
  const ha7Dias = new Date(hoje);
  ha7Dias.setDate(ha7Dias.getDate() - 7);

  const tarefas = [
    // Tarefas URGENTES
    {
      titulo: 'Tratamento Fitossanitário Urgente - Cerejeiras',
      descricao: 'Aplicar fungicida nas cerejeiras devido a sinais de doença. Condições meteorológicas favoráveis.',
      tipo: 'TRATAMENTO',
      prioridade: 'URGENTE',
      estado: 'PLANEADA',
      dataInicio: amanha,
      dataFim: amanha,
      janelaMeteo: { score: 92, vento: 8, chuva: 0, temp: 21 },
    },

    // Tarefas ALTA prioridade
    {
      titulo: 'Rega de Emergência - Parcela Norte',
      descricao: 'Rega manual nas árvores jovens devido ao calor extremo previsto.',
      tipo: 'REGA',
      prioridade: 'ALTA',
      estado: 'PLANEADA',
      dataInicio: hoje,
      dataFim: hoje,
      janelaMeteo: { score: 88, vento: 5, chuva: 0, temp: 34 },
    },
    {
      titulo: 'Poda de Formação - Castanheiros',
      descricao: 'Poda de formação nos castanheiros da parcela sul antes da época de crescimento.',
      tipo: 'PODA',
      prioridade: 'ALTA',
      estado: 'EM_CURSO',
      dataInicio: ha3Dias,
      dataFim: amanha,
    },

    // Tarefas MEDIA prioridade
    {
      titulo: 'Inspeção Semanal - Todas as Parcelas',
      descricao: 'Inspeção de rotina para detetar pragas, doenças e problemas de crescimento.',
      tipo: 'INSPECAO',
      prioridade: 'MEDIA',
      estado: 'PLANEADA',
      dataInicio: em3Dias,
      dataFim: em3Dias,
    },
    {
      titulo: 'Adubação de Cobertura - Nogueiras',
      descricao: 'Aplicar adubo NPK nas nogueiras conforme plano de fertilização.',
      tipo: 'ADUBACAO',
      prioridade: 'MEDIA',
      estado: 'PLANEADA',
      dataInicio: em5Dias,
      dataFim: em5Dias,
      janelaMeteo: { score: 75, vento: 10, chuva: 0, temp: 18 },
    },
    {
      titulo: 'Plantação de Novas Árvores - Parcela Leste',
      descricao: 'Plantar 50 castanheiros híbridos na parcela leste.',
      tipo: 'PLANTACAO',
      prioridade: 'MEDIA',
      estado: 'PLANEADA',
      dataInicio: em7Dias,
      dataFim: em7Dias,
    },

    // Tarefas BAIXA prioridade
    {
      titulo: 'Desbaste de Ramos - Cerejeiras Jovens',
      descricao: 'Desbaste leve para melhorar ventilação e penetração de luz.',
      tipo: 'PODA',
      prioridade: 'BAIXA',
      estado: 'PLANEADA',
      dataInicio: em7Dias,
      dataFim: em7Dias,
    },

    // Tarefas CONCLUÍDAS
    {
      titulo: 'Colheita de Cerejas - Parcela Norte',
      descricao: 'Colheita manual das cerejas variedade Burlat.',
      tipo: 'COLHEITA',
      prioridade: 'ALTA',
      estado: 'CONCLUIDA',
      dataInicio: ha7Dias,
      dataFim: ha3Dias,
      dataConclusao: ha3Dias,
    },
    {
      titulo: 'Inspeção Pós-Tempestade',
      descricao: 'Verificar danos causados pela tempestade de 15/11.',
      tipo: 'INSPECAO',
      prioridade: 'URGENTE',
      estado: 'CONCLUIDA',
      dataInicio: ha7Dias,
      dataFim: ha7Dias,
      dataConclusao: ha7Dias,
    },

    // Tarefas ATRASADAS (passaram da data fim)
    {
      titulo: 'Poda de Inverno - Parcela Sul',
      descricao: 'Poda de inverno nas árvores de fruto. ATRASADA!',
      tipo: 'PODA',
      prioridade: 'ALTA',
      estado: 'PLANEADA',
      dataInicio: ha7Dias,
      dataFim: ontem,
    },

    // Tarefas CANCELADAS
    {
      titulo: 'Tratamento Preventivo - Cancelado por Chuva',
      descricao: 'Aplicação de tratamento preventivo cancelada devido a condições meteorológicas desfavoráveis.',
      tipo: 'TRATAMENTO',
      prioridade: 'MEDIA',
      estado: 'CANCELADA',
      dataInicio: ha3Dias,
      dataFim: ha3Dias,
      janelaMeteo: { score: 25, vento: 45, chuva: 80, temp: 12 },
    },
  ];

  let count = 0;
  for (const tarefa of tarefas) {
    await prisma.tarefa.create({ data: tarefa });
    count++;

    const estadoEmoji = {
      PLANEADA: '📅',
      EM_CURSO: '⚙️',
      CONCLUIDA: '✅',
      CANCELADA: '❌',
    }[tarefa.estado];

    const prioridadeEmoji = {
      URGENTE: '🔴',
      ALTA: '🟠',
      MEDIA: '🟡',
      BAIXA: '🟢',
    }[tarefa.prioridade];

    console.log(`${estadoEmoji} ${prioridadeEmoji} ${count}. ${tarefa.titulo} (${tarefa.tipo})`);
  }

  console.log(`\n🎉 Total de ${count} tarefas inseridas com sucesso!`);

  // Stats
  const stats = await prisma.tarefa.groupBy({
    by: ['estado'],
    _count: true,
  });

  console.log('\n📊 Resumo por estado:');
  stats.forEach(s => {
    const emoji = {
      PLANEADA: '📅',
      EM_CURSO: '⚙️',
      CONCLUIDA: '✅',
      CANCELADA: '❌',
    }[s.estado];
    console.log(`  ${emoji} ${s.estado}: ${s._count}`);
  });

  // Tarefas atrasadas
  const atrasadas = await prisma.tarefa.findMany({
    where: {
      estado: { in: ['PLANEADA', 'EM_CURSO'] },
      dataFim: { lt: new Date() },
    },
  });

  if (atrasadas.length > 0) {
    console.log(`\n⚠️  ${atrasadas.length} tarefas atrasadas:`);
    atrasadas.forEach(t => {
      const diasAtraso = Math.floor((Date.now() - new Date(t.dataFim!).getTime()) / (1000 * 60 * 60 * 24));
      console.log(`  - ${t.titulo} (${diasAtraso} dias de atraso)`);
    });
  }

  // Tarefas de hoje
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const tarefasHoje = await prisma.tarefa.findMany({
    where: {
      OR: [
        {
          dataInicio: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        {
          estado: 'EM_CURSO',
        },
      ],
    },
  });

  if (tarefasHoje.length > 0) {
    console.log(`\n📆 ${tarefasHoje.length} tarefas para hoje:`);
    tarefasHoje.forEach(t => {
      const prioEmoji = {
        URGENTE: '🔴',
        ALTA: '🟠',
        MEDIA: '🟡',
        BAIXA: '🟢',
      }[t.prioridade];
      console.log(`  ${prioEmoji} ${t.titulo}`);
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
