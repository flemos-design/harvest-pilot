// Tipos da API

export interface Organizacao {
  id: string;
  nome: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    propriedades: number;
    utilizadores: number;
  };
  propriedades?: Array<{
    id: string;
    nome: string;
    descricao?: string;
    createdAt: string;
  }>;
}

export interface CreateOrganizacaoDto {
  nome: string;
  slug: string;
}

export interface OrganizacaoStats {
  total: number;
  withPropriedades: number;
  totalPropriedades: number;
  totalUtilizadores: number;
  avgPropriedadesPorOrganizacao: number;
}

export type Finalidade = 'FRUTO' | 'MADEIRA';

export interface CalendarioRegra {
  id: string;
  cultura: string;
  variedade?: string;
  finalidade?: Finalidade;
  tipoOperacao: string;
  regiao?: string;
  mesInicio: number;
  mesFim: number;
  tbase?: number;
  gddAlvo?: number;
  ventoMax?: number;
  chuvaMax?: number;
  phiDias?: number;
  descricao?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarioRegraDto {
  cultura: string;
  variedade?: string;
  finalidade?: Finalidade;
  tipoOperacao: string;
  regiao?: string;
  mesInicio: number;
  mesFim: number;
  tbase?: number;
  gddAlvo?: number;
  ventoMax?: number;
  chuvaMax?: number;
  phiDias?: number;
  descricao?: string;
}

export interface CalendarioStats {
  total: number;
  porCultura: Array<{
    cultura: string;
    count: number;
  }>;
  porTipoOperacao: Array<{
    tipoOperacao: string;
    count: number;
  }>;
  porRegiao: Array<{
    regiao: string;
    count: number;
  }>;
}

export interface Propriedade {
  id: string;
  nome: string;
  descricao?: string;
  organizacaoId: string;
  createdAt: string;
  updatedAt: string;
  organizacao?: {
    id: string;
    nome: string;
  };
  _count?: {
    parcelas: number;
  };
}

export interface Parcela {
  id: string;
  nome: string;
  area: number;
  geometria: string | GeoJSON.Polygon;
  altitude?: number;
  tipoSolo?: string;
  propriedadeId: string;
  createdAt: string;
  updatedAt: string;
  propriedade?: {
    id: string;
    nome: string;
  };
  culturas?: Cultura[];
  _count?: {
    operacoes: number;
    imagensRemotas: number;
  };
}

export interface Cultura {
  id: string;
  especie: string;
  variedade?: string;
  finalidade: 'FRUTO' | 'MADEIRA';
  parcelaId: string;
  createdAt: string;
  updatedAt: string;
  ciclos?: Ciclo[];
}

export interface Ciclo {
  id: string;
  epoca: string;
  dataInicio: string;
  dataFim?: string;
  estado: 'ATIVO' | 'CONCLUIDO' | 'CANCELADO';
  culturaId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Operacao {
  id: string;
  tipo: 'PLANTACAO' | 'REGA' | 'ADUBACAO' | 'TRATAMENTO' | 'COLHEITA' | 'INSPECAO' | 'PODA' | 'DESBASTE';
  data: string;
  descricao?: string;
  notas?: string;
  latitude?: number;
  longitude?: number;
  fotos?: string[];
  insumos?: any;
  custoTotal?: number;
  parcelaId: string;
  cicloId?: string;
  operadorId: string;
  createdAt: string;
  updatedAt: string;
  parcela?: {
    id: string;
    nome: string;
    area?: number;
  };
  operador?: {
    id: string;
    nome: string;
    email?: string;
  };
}

// DTOs para criação
export interface CreatePropriedadeDto {
  nome: string;
  descricao?: string;
  organizacaoId: string;
}

export interface CreateParcelaDto {
  nome: string;
  area: number;
  geometria: GeoJSON.Polygon;
  altitude?: number;
  tipoSolo?: string;
  propriedadeId: string;
}

export interface CreateOperacaoDto {
  tipo: Operacao['tipo'];
  data: string;
  descricao?: string;
  notas?: string;
  latitude?: number;
  longitude?: number;
  fotos?: string[];
  insumos?: any;
  custoTotal?: number;
  parcelaId: string;
  cicloId?: string;
  operadorId: string;
}

export interface CreateCulturaDto {
  especie: string;
  variedade?: string;
  finalidade?: 'FRUTO' | 'MADEIRA';
  parcelaId: string;
}

export interface CreateCicloDto {
  epoca: string;
  dataInicio: string;
  dataFim?: string;
  estado?: 'ATIVO' | 'CONCLUIDO' | 'CANCELADO';
  culturaId: string;
}

export interface CreateImagemRemotaDto {
  data: string;
  fonte?: string;
  nuvens?: number;
  ndvi?: number;
  ndre?: number;
  evi?: number;
  urlImagem?: string;
  metadados?: any;
  parcelaId: string;
}

export interface MeteoParcela {
  id: string;
  parcelaId: string;
  data: string;
  fonte: string;
  temperatura?: number;
  tempMin?: number;
  tempMax?: number;
  precipitacao?: number;
  probChuva?: number;
  vento?: number;
  humidade?: number;
  createdAt: string;
  parcela?: {
    id: string;
    nome: string;
    area?: number;
  };
}

export interface CreateMeteoParcelaDto {
  parcelaId: string;
  data: string;
  fonte?: string;
  temperatura?: number;
  tempMin?: number;
  tempMax?: number;
  precipitacao?: number;
  probChuva?: number;
  vento?: number;
  humidade?: number;
}

export interface MeteoStats {
  temperaturaMedia: number | null;
  tempMinMedia: number | null;
  tempMaxMedia: number | null;
  precipitacaoTotal: number;
  ventoMedio: number | null;
  humidadeMedia: number | null;
  totalRegistos: number;
}

export interface Insumo {
  id: string;
  nome: string;
  categoria: 'FERTILIZANTE' | 'FITOFARMACO' | 'SEMENTE' | 'OUTRO';
  unidade: string;
  stock: number;
  stockMinimo: number | null;
  custoUnit: number | null;
  validade: string | null;
  lote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInsumoDto {
  nome: string;
  categoria: string;
  unidade: string;
  stock?: number;
  stockMinimo?: number;
  custoUnit?: number;
  validade?: string;
  lote?: string;
}

export type TipoTarefa = 'PLANTACAO' | 'COLHEITA' | 'TRATAMENTO' | 'REGA' | 'ADUBACAO' | 'PODA' | 'INSPECAO' | 'OUTRO';
export type PrioridadeTarefa = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
export type EstadoTarefa = 'PLANEADA' | 'EM_CURSO' | 'CONCLUIDA' | 'CANCELADA';

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: TipoTarefa;
  prioridade: PrioridadeTarefa;
  estado: EstadoTarefa;
  dataInicio: string;
  dataFim: string | null;
  dataConclusao: string | null;
  janelaMeteo: {
    score?: number;
    vento?: number;
    chuva?: number;
    temp?: number;
  } | null;
  responsavelId: string | null;
  createdAt: string;
  updatedAt: string;
  responsavel?: {
    id: string;
    nome: string;
    email: string;
  };
}

export interface CreateTarefaDto {
  titulo: string;
  descricao?: string;
  tipo: TipoTarefa;
  prioridade?: PrioridadeTarefa;
  estado?: EstadoTarefa;
  dataInicio: string;
  dataFim?: string;
  dataConclusao?: string;
  janelaMeteo?: {
    score?: number;
    vento?: number;
    chuva?: number;
    temp?: number;
  };
  responsavelId?: string;
}

export interface TarefaStats {
  total: number;
  porEstado: Array<{
    estado: string;
    count: number;
  }>;
  porPrioridade: Array<{
    prioridade: string;
    count: number;
  }>;
  atrasadasCount: number;
}

// Resumo
export interface OperacoesResumo {
  totalOperacoes: number;
  custoTotal: number;
  operacoesPorTipo: Array<{
    tipo: string;
    count: number;
  }>;
}

export interface ParcelaStats {
  parcelaId: string;
  nome: string;
  area: number;
  stats: {
    totalOperacoes: number;
    ultimaOperacao?: {
      tipo: string;
      data: string;
    };
    imagensCount: number;
    ultimoNDVI?: {
      ndvi: number;
      data: string;
    };
  };
}

export interface CulturaStats {
  total: number;
  porEspecie: Array<{
    especie: string;
    _count: number;
  }>;
  porFinalidade: Array<{
    finalidade: string;
    _count: number;
  }>;
}

export interface CicloStats {
  total: number;
  porEstado: Array<{
    estado: string;
    _count: number;
  }>;
  cicloAtivo?: Ciclo;
}

export interface ImagemRemota {
  id: string;
  parcelaId: string;
  fonte: string;
  data: string;
  nuvens?: number;
  ndvi?: number;
  ndre?: number;
  evi?: number;
  urlImagem?: string;
  metadados?: any;
  createdAt: string;
  parcela?: {
    id: string;
    nome: string;
    area?: number;
    propriedade?: {
      id: string;
      nome: string;
    };
  };
}

// ===== UTILIZADORES =====

export type PapelUtilizador = 'ADMIN' | 'GESTOR' | 'PLANEADOR' | 'OPERADOR';

export interface Utilizador {
  id: string;
  email: string;
  nome: string;
  papel: PapelUtilizador;
  organizacaoId: string;
  createdAt: string;
  updatedAt: string;
  organizacao?: {
    id: string;
    nome: string;
  };
  _count?: {
    operacoes: number;
    tarefas: number;
  };
}

export interface CreateUtilizadorDto {
  email: string;
  nome: string;
  password: string;
  papel?: PapelUtilizador;
  organizacaoId: string;
}

export interface UpdateUtilizadorDto {
  email?: string;
  nome?: string;
  papel?: PapelUtilizador;
  organizacaoId?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UtilizadorStats {
  total: number;
  porPapel: Array<{
    papel: string;
    count: number;
  }>;
  comMaisOperacoes: Array<{
    id: string;
    nome: string;
    totalOperacoes: number;
  }>;
  comMaisTarefas: Array<{
    id: string;
    nome: string;
    totalTarefas: number;
  }>;
}

// ====================
// IA Types
// ====================

export interface ChatMessage {
  message: string;
  parcelaId?: string;
  organizacaoId: string;
}

export interface ChatResponse {
  answer: string;
  sources: string[];
  confidence: number;
  explanation?: string;
}

export type InsightType = 'warning' | 'recommendation' | 'alert' | 'info';

export interface Insight {
  type: InsightType;
  title: string;
  description: string;
  parcelaIds: string[];
  priority: number;
  actions: string[];
  explanation: string;
  dataPoints: Record<string, any>;
}

export interface CriticalParcela {
  parcelaId: string;
  nome: string;
  area: number;
  cultura: string;
  score: number;
  reasons: string[];
}
