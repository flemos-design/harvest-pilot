import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TarefasService } from './tarefas.service';
import { CreateTarefaDto, EstadoTarefa, PrioridadeTarefa } from './dto/create-tarefa.dto';
import { UpdateTarefaDto } from './dto/update-tarefa.dto';

@ApiTags('tarefas')
@Controller('tarefas')
export class TarefasController {
  constructor(private readonly tarefasService: TarefasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova tarefa' })
  create(@Body() createTarefaDto: CreateTarefaDto) {
    return this.tarefasService.create(createTarefaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as tarefas com filtros opcionais' })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoTarefa })
  @ApiQuery({ name: 'prioridade', required: false, enum: PrioridadeTarefa })
  @ApiQuery({ name: 'tipo', required: false })
  @ApiQuery({ name: 'responsavelId', required: false })
  findAll(
    @Query('estado') estado?: EstadoTarefa,
    @Query('prioridade') prioridade?: PrioridadeTarefa,
    @Query('tipo') tipo?: string,
    @Query('responsavelId') responsavelId?: string,
  ) {
    return this.tarefasService.findAll({
      estado,
      prioridade,
      tipo,
      responsavelId,
    });
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Tarefas que começam nos próximos N dias' })
  @ApiQuery({ name: 'days', required: false, description: 'Número de dias (padrão: 7)' })
  getUpcoming(@Query('days') days?: string) {
    const numDays = days ? parseInt(days, 10) : 7;
    return this.tarefasService.getUpcoming(numDays);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Tarefas atrasadas' })
  getOverdue() {
    return this.tarefasService.getOverdue();
  }

  @Get('today')
  @ApiOperation({ summary: 'Tarefas de hoje' })
  getTodayTasks() {
    return this.tarefasService.getTodayTasks();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas de tarefas' })
  getStats() {
    return this.tarefasService.getStats();
  }

  @Get('estado/:estado')
  @ApiOperation({ summary: 'Filtrar tarefas por estado' })
  getByEstado(@Param('estado') estado: EstadoTarefa) {
    return this.tarefasService.getByEstado(estado);
  }

  @Get('prioridade/:prioridade')
  @ApiOperation({ summary: 'Filtrar tarefas por prioridade' })
  getByPrioridade(@Param('prioridade') prioridade: PrioridadeTarefa) {
    return this.tarefasService.getByPrioridade(prioridade);
  }

  @Get('responsavel/:responsavelId')
  @ApiOperation({ summary: 'Filtrar tarefas por responsável' })
  getByResponsavel(@Param('responsavelId') responsavelId: string) {
    return this.tarefasService.getByResponsavel(responsavelId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma tarefa por ID' })
  findOne(@Param('id') id: string) {
    return this.tarefasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma tarefa' })
  update(@Param('id') id: string, @Body() updateTarefaDto: UpdateTarefaDto) {
    return this.tarefasService.update(id, updateTarefaDto);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Atualizar apenas o estado de uma tarefa' })
  updateEstado(@Param('id') id: string, @Body() body: { estado: EstadoTarefa }) {
    return this.tarefasService.updateEstado(id, body.estado);
  }

  @Patch(':id/concluir')
  @ApiOperation({ summary: 'Marcar tarefa como concluída' })
  markConcluida(@Param('id') id: string) {
    return this.tarefasService.markConcluida(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma tarefa' })
  remove(@Param('id') id: string) {
    return this.tarefasService.remove(id);
  }
}
