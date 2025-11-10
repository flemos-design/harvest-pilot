import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { UtilizadoresService } from './utilizadores.service';
import { CreateUtilizadorDto } from './dto/create-utilizador.dto';
import { UpdateUtilizadorDto } from './dto/update-utilizador.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('utilizadores')
@ApiBearerAuth()
@Controller('utilizadores')
export class UtilizadoresController {
  constructor(private readonly utilizadoresService: UtilizadoresService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Criar novo utilizador (registo)' })
  create(@Body() createUtilizadorDto: CreateUtilizadorDto) {
    return this.utilizadoresService.create(createUtilizadorDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login de utilizador' })
  login(@Body() loginDto: LoginDto) {
    return this.utilizadoresService.login(loginDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os utilizadores' })
  @ApiQuery({ name: 'organizacaoId', required: false })
  findAll(@Query('organizacaoId') organizacaoId?: string) {
    return this.utilizadoresService.findAll(organizacaoId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas de utilizadores' })
  @ApiQuery({ name: 'organizacaoId', required: false })
  getStats(@Query('organizacaoId') organizacaoId?: string) {
    return this.utilizadoresService.getStats(organizacaoId);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Obter utilizador por email' })
  findByEmail(@Param('email') email: string) {
    return this.utilizadoresService.findByEmail(email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter utilizador por ID' })
  findOne(@Param('id') id: string) {
    return this.utilizadoresService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar utilizador' })
  update(@Param('id') id: string, @Body() updateUtilizadorDto: UpdateUtilizadorDto) {
    return this.utilizadoresService.update(id, updateUtilizadorDto);
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Alterar password do utilizador' })
  changePassword(@Param('id') id: string, @Body() changePasswordDto: ChangePasswordDto) {
    return this.utilizadoresService.changePassword(id, changePasswordDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover utilizador' })
  remove(@Param('id') id: string) {
    return this.utilizadoresService.remove(id);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar recuperação de password' })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.utilizadoresService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redefinir password com token' })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.utilizadoresService.resetPassword(resetPasswordDto);
  }
}
