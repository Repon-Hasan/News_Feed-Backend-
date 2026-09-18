import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/tag.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Tags')
@Controller('v1/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all tags' })
  async findAll() {
    return this.tagsService.findAll();
  }

  @Public()
  @Get('popular')
  @ApiOperation({ summary: 'Get popular tags' })
  async findPopular(@Query('limit') limit?: string) {
    return this.tagsService.findPopular(limit ? parseInt(limit, 10) : 10);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.REPORTER)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create new tag (Admin/Reporter)' })
  async create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete tag (Admin only)' })
  async delete(@Param('id') id: string) {
    return this.tagsService.delete(id);
  }
}
