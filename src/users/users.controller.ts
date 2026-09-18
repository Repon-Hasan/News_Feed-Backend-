import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserRoleDto, UpdateUserStatusDto, UpdateProfileDto } from './dto/user.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role, ArticleStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users & Administration')
@Controller('v1')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Patch('users/profile')
  @ApiOperation({ summary: 'Update own profile' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Get('admin/users')
  @ApiOperation({ summary: 'List all users for admin management' })
  async findAllUsers(
    @Query('search') search?: string,
    @Query('role') role?: Role,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.usersService.findAllUsers(
      search,
      role,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Patch('admin/users/:id/role')
  @ApiOperation({ summary: 'Promote or change user role (Admin only)' })
  async updateRole(
    @Param('id') targetUserId: string,
    @CurrentUser('id') currentAdminId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateUserRole(targetUserId, currentAdminId, dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Patch('admin/users/:id/status')
  @ApiOperation({ summary: 'Activate or deactivate user account (Admin only)' })
  async updateStatus(
    @Param('id') targetUserId: string,
    @CurrentUser('id') currentAdminId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateUserStatus(targetUserId, currentAdminId, dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Get('admin/analytics')
  @ApiOperation({ summary: 'Get overview metrics for admin dashboard' })
  async getAnalytics() {
    return this.usersService.getAdminAnalytics();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Get('admin/articles')
  @ApiOperation({ summary: 'Get all articles across platform for editorial review desk' })
  async getAdminArticles(
    @Query('status') status?: ArticleStatus,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.usersService.getAdminArticles(
      status,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }
}
