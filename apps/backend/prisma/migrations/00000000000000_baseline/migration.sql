-- CreateTable
CREATE TABLE "organizacoes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilizadores" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "papel" TEXT NOT NULL DEFAULT 'OPERADOR',
    "organizacao_id" TEXT NOT NULL,
    "reset_token" TEXT,
    "reset_token_expiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilizadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propriedades" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "organizacao_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "propriedades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcelas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "geometria" TEXT NOT NULL,
    "altitude" DOUBLE PRECISION,
    "tipo_solo" TEXT,
    "propriedade_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parcelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "culturas" (
    "id" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "variedade" TEXT,
    "finalidade" TEXT NOT NULL DEFAULT 'FRUTO',
    "parcela_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "culturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ciclos" (
    "id" TEXT NOT NULL,
    "epoca" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'ATIVO',
    "cultura_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ciclos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operacoes" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT,
    "notas" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "fotos" TEXT[],
    "insumos" JSONB,
    "custo_total" DOUBLE PRECISION DEFAULT 0,
    "parcela_id" TEXT NOT NULL,
    "ciclo_id" TEXT,
    "operador_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarefas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL DEFAULT 'MEDIA',
    "estado" TEXT NOT NULL DEFAULT 'PLANEADA',
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3),
    "data_conclusao" TIMESTAMP(3),
    "janela_meteo" JSONB,
    "responsavel_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarefas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meteo_parcelas" (
    "id" TEXT NOT NULL,
    "parcela_id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "fonte" TEXT NOT NULL DEFAULT 'IPMA',
    "temperatura" DOUBLE PRECISION,
    "temp_min" DOUBLE PRECISION,
    "temp_max" DOUBLE PRECISION,
    "precipitacao" DOUBLE PRECISION,
    "prob_chuva" DOUBLE PRECISION,
    "vento" DOUBLE PRECISION,
    "humidade" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meteo_parcelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagens_remotas" (
    "id" TEXT NOT NULL,
    "parcela_id" TEXT NOT NULL,
    "fonte" TEXT NOT NULL DEFAULT 'SENTINEL',
    "data" TIMESTAMP(3) NOT NULL,
    "nuvens" DOUBLE PRECISION,
    "ndvi" DOUBLE PRECISION,
    "ndre" DOUBLE PRECISION,
    "evi" DOUBLE PRECISION,
    "url_imagem" TEXT,
    "metadados" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagens_remotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insumos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock_minimo" DOUBLE PRECISION DEFAULT 0,
    "custo_unitario" DOUBLE PRECISION,
    "validade" TIMESTAMP(3),
    "lote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendario_regras" (
    "id" TEXT NOT NULL,
    "cultura" TEXT NOT NULL,
    "variedade" TEXT,
    "finalidade" TEXT NOT NULL DEFAULT 'FRUTO',
    "tipo_operacao" TEXT NOT NULL,
    "regiao" TEXT DEFAULT 'Espinhosela',
    "mes_inicio" INTEGER NOT NULL,
    "mes_fim" INTEGER NOT NULL,
    "tbase" DOUBLE PRECISION,
    "gdd_alvo" INTEGER,
    "vento_max" DOUBLE PRECISION,
    "chuva_max" DOUBLE PRECISION,
    "phi_dias" INTEGER,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendario_regras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversas_ia" (
    "id" TEXT NOT NULL,
    "organizacao_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversas_ia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens_ia" (
    "id" TEXT NOT NULL,
    "conversa_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_ia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizacoes_slug_key" ON "organizacoes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "utilizadores_email_key" ON "utilizadores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "utilizadores_reset_token_key" ON "utilizadores"("reset_token");

-- CreateIndex
CREATE INDEX "parcelas_propriedade_id_idx" ON "parcelas"("propriedade_id");

-- CreateIndex
CREATE INDEX "operacoes_parcela_id_idx" ON "operacoes"("parcela_id");

-- CreateIndex
CREATE INDEX "operacoes_operador_id_idx" ON "operacoes"("operador_id");

-- CreateIndex
CREATE INDEX "operacoes_data_idx" ON "operacoes"("data");

-- CreateIndex
CREATE INDEX "tarefas_responsavel_id_idx" ON "tarefas"("responsavel_id");

-- CreateIndex
CREATE INDEX "tarefas_data_inicio_idx" ON "tarefas"("data_inicio");

-- CreateIndex
CREATE INDEX "meteo_parcelas_parcela_id_idx" ON "meteo_parcelas"("parcela_id");

-- CreateIndex
CREATE INDEX "meteo_parcelas_data_idx" ON "meteo_parcelas"("data");

-- CreateIndex
CREATE UNIQUE INDEX "meteo_parcelas_parcela_id_data_fonte_key" ON "meteo_parcelas"("parcela_id", "data", "fonte");

-- CreateIndex
CREATE INDEX "imagens_remotas_parcela_id_idx" ON "imagens_remotas"("parcela_id");

-- CreateIndex
CREATE UNIQUE INDEX "imagens_remotas_parcela_id_data_fonte_key" ON "imagens_remotas"("parcela_id", "data", "fonte");

-- CreateIndex
CREATE INDEX "conversas_ia_organizacao_id_idx" ON "conversas_ia"("organizacao_id");

-- CreateIndex
CREATE INDEX "conversas_ia_updatedAt_idx" ON "conversas_ia"("updatedAt");

-- CreateIndex
CREATE INDEX "mensagens_ia_conversa_id_idx" ON "mensagens_ia"("conversa_id");

-- CreateIndex
CREATE INDEX "mensagens_ia_createdAt_idx" ON "mensagens_ia"("createdAt");

-- CreateIndex
CREATE INDEX "notificacoes_user_id_idx" ON "notificacoes"("user_id");

-- CreateIndex
CREATE INDEX "notificacoes_lida_idx" ON "notificacoes"("lida");

-- CreateIndex
CREATE INDEX "notificacoes_createdAt_idx" ON "notificacoes"("createdAt");

-- AddForeignKey
ALTER TABLE "utilizadores" ADD CONSTRAINT "utilizadores_organizacao_id_fkey" FOREIGN KEY ("organizacao_id") REFERENCES "organizacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propriedades" ADD CONSTRAINT "propriedades_organizacao_id_fkey" FOREIGN KEY ("organizacao_id") REFERENCES "organizacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcelas" ADD CONSTRAINT "parcelas_propriedade_id_fkey" FOREIGN KEY ("propriedade_id") REFERENCES "propriedades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "culturas" ADD CONSTRAINT "culturas_parcela_id_fkey" FOREIGN KEY ("parcela_id") REFERENCES "parcelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ciclos" ADD CONSTRAINT "ciclos_cultura_id_fkey" FOREIGN KEY ("cultura_id") REFERENCES "culturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operacoes" ADD CONSTRAINT "operacoes_parcela_id_fkey" FOREIGN KEY ("parcela_id") REFERENCES "parcelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operacoes" ADD CONSTRAINT "operacoes_ciclo_id_fkey" FOREIGN KEY ("ciclo_id") REFERENCES "ciclos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operacoes" ADD CONSTRAINT "operacoes_operador_id_fkey" FOREIGN KEY ("operador_id") REFERENCES "utilizadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "utilizadores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meteo_parcelas" ADD CONSTRAINT "meteo_parcelas_parcela_id_fkey" FOREIGN KEY ("parcela_id") REFERENCES "parcelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagens_remotas" ADD CONSTRAINT "imagens_remotas_parcela_id_fkey" FOREIGN KEY ("parcela_id") REFERENCES "parcelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_ia" ADD CONSTRAINT "mensagens_ia_conversa_id_fkey" FOREIGN KEY ("conversa_id") REFERENCES "conversas_ia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

