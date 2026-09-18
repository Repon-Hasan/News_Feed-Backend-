import { Controller, Get, Post, Delete, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdvertisementsService } from './advertisements.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role, AdPlacement } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Advertisements')
@Controller('v1/advertisements')
export class AdvertisementsController {
  constructor(private readonly adsService: AdvertisementsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get active advertisements for placements' })
  async getActiveAds(@Query('placement') placement?: AdPlacement) {
    return this.adsService.findActiveByPlacement(placement);
  }

  @Public()
  @Post(':id/click')
  @ApiOperation({ summary: 'Record click on advertisement' })
  async recordClick(@Param('id') id: string) {
    return this.adsService.recordClick(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Get('all')
  @ApiOperation({ summary: 'List all ads (Admin only)' })
  async getAll() {
    return this.adsService.findAll();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create new advertisement (Admin only)' })
  async create(@Body() data: any) {
    return this.adsService.create(data);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Patch(':id/status')
  @ApiOperation({ summary: 'Toggle advertisement active status (Admin only)' })
  async toggleActive(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.adsService.toggleActive(id, isActive);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete advertisement (Admin only)' })
  async delete(@Param('id') id: string) {
    return this.adsService.delete(id);
  }
}
