import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportersService } from './reporters.service';
import { UpdateReporterProfileDto } from './dto/reporter.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role, ArticleStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Reporters')
@Controller('v1')
export class ReportersController {
  constructor(private readonly reportersService: ReportersService) {}

  @Public()
  @Get('reporters')
  @ApiOperation({ summary: 'List all news reporters' })
  async findAll() {
    return this.reportersService.findAll();
  }

  @Public()
  @Get('reporters/:id')
  @ApiOperation({ summary: 'Get reporter profile and published articles' })
  async findById(@Param('id') id: string) {
    return this.reportersService.findById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.REPORTER, Role.ADMIN)
  @ApiBearerAuth()
  @Get('reporter/articles')
  @ApiOperation({ summary: 'Get current reporter articles by status' })
  async getMyArticles(
    @CurrentUser('id') userId: string,
    @Query('status') status?: ArticleStatus,
  ) {
    return this.reportersService.getReporterArticles(userId, status);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.REPORTER, Role.ADMIN)
  @ApiBearerAuth()
  @Get('reporter/analytics')
  @ApiOperation({ summary: 'Get reporter dashboard statistics' })
  async getMyAnalytics(@CurrentUser('id') userId: string) {
    return this.reportersService.getReporterAnalytics(userId);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.REPORTER, Role.ADMIN)
  @ApiBearerAuth()
  @Patch('reporter/profile')
  @ApiOperation({ summary: 'Update reporter profile information' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateReporterProfileDto,
  ) {
    return this.reportersService.updateProfile(userId, dto);
  }
}
