import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ArticlesService } from './articles.service';
import {
  CreateArticleDto,
  UpdateArticleDto,
  ArticleFilterDto,
  RejectArticleDto,
} from './dto/article.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Articles')
@Controller('v1')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Public()
  @Get('articles')
  @ApiOperation({ summary: 'List published articles with pagination and filtering' })
  async findAll(@Query() filter: ArticleFilterDto) {
    return this.articlesService.findAll(filter, false);
  }

  @Public()
  @Get('breaking')
  @ApiOperation({ summary: 'Get active breaking news ticker' })
  async getBreaking(@Query('limit') limit?: string) {
    return this.articlesService.getBreaking(limit ? parseInt(limit, 10) : 5);
  }

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Get trending news calculated with recency, views, and likes' })
  async getTrending(@Query('limit') limit?: string) {
    return this.articlesService.getTrending(limit ? parseInt(limit, 10) : 10);
  }

  @Public()
  @Get('articles/:slug')
  @ApiOperation({ summary: 'Get single article by slug and record view' })
  async findBySlug(@Param('slug') slug: string, @Req() req: Request) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'anonymous';
    const userId = (req as any).user?.id;
    return this.articlesService.findBySlug(slug, ip, userId);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.REPORTER, Role.ADMIN)
  @ApiBearerAuth()
  @Post('articles')
  @ApiOperation({ summary: 'Create new article draft (Reporter/Admin)' })
  async create(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
    @Body() dto: CreateArticleDto,
  ) {
    return this.articlesService.create(userId, dto, userRole);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.REPORTER, Role.ADMIN)
  @ApiBearerAuth()
  @Patch('articles/:id')
  @ApiOperation({ summary: 'Update article (Reporter for own draft/rejected, Admin for all)' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
    @Body() dto: UpdateArticleDto,
  ) {
    return this.articlesService.update(id, userId, userRole, dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.REPORTER, Role.ADMIN)
  @ApiBearerAuth()
  @Delete('articles/:id')
  @ApiOperation({ summary: 'Delete article' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.articlesService.delete(id, userId, userRole);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.REPORTER, Role.ADMIN)
  @ApiBearerAuth()
  @Post('articles/:id/submit')
  @ApiOperation({ summary: 'Submit article draft for editorial review' })
  async submit(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.articlesService.submitForReview(id, userId);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Post('articles/:id/approve')
  @ApiOperation({ summary: 'Approve article (Admin only)' })
  async approve(@Param('id') id: string) {
    return this.articlesService.approve(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Post('articles/:id/reject')
  @ApiOperation({ summary: 'Reject article with feedback (Admin only)' })
  async reject(@Param('id') id: string, @Body() dto: RejectArticleDto) {
    return this.articlesService.reject(id, dto.reason);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Post('articles/:id/publish')
  @ApiOperation({ summary: 'Publish approved article (Admin only)' })
  async publish(@Param('id') id: string) {
    return this.articlesService.publish(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Post('articles/:id/unpublish')
  @ApiOperation({ summary: 'Unpublish article back to draft (Admin only)' })
  async unpublish(@Param('id') id: string) {
    return this.articlesService.unpublish(id);
  }
}
