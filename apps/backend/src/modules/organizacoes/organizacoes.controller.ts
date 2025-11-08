import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrganizacoesService } from './organizacoes.service';
import { CreateOrganizacaoDto } from './dto/create-organizacao.dto';
import { UpdateOrganizacaoDto } from './dto/update-organizacao.dto';

@ApiTags('organizacoes')
@Controller('organizacoes')
export class OrganizacoesController {
  constructor(private readonly organizacoesService: OrganizacoesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova organização' })
  create(@Body() createOrganizacaoDto: CreateOrganizacaoDto) {
    return this.organizacoesService.create(createOrganizacaoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as organizações' })
  findAll() {
    return this.organizacoesService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas de organizações' })
  getStats() {
    return this.organizacoesService.getStats();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obter organização por slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.organizacoesService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma organização por ID' })
  findOne(@Param('id') id: string) {
    return this.organizacoesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma organização' })
  update(@Param('id') id: string, @Body() updateOrganizacaoDto: UpdateOrganizacaoDto) {
    return this.organizacoesService.update(id, updateOrganizacaoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma organização' })
  remove(@Param('id') id: string) {
    return this.organizacoesService.remove(id);
  }
}
