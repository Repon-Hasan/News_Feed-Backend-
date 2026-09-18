import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, ReportCommentDto } from './dto/comment.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role, CommentStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Comments')
@Controller('v1/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Public()
  @Get('article/:articleId')
  @ApiOperation({ summary: 'Get all approved comments for an article' })
  async findByArticle(@Param('articleId') articleId: string) {
    return this.commentsService.findByArticle(articleId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Add a comment or reply (Authenticated user)' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(userId, dto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete own comment (or Admin can delete any)' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.commentsService.delete(id, userId, userRole);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post(':id/report')
  @ApiOperation({ summary: 'Report a comment' })
  async report(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ReportCommentDto,
  ) {
    return this.commentsService.report(id, userId, dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Get('moderation/flagged')
  @ApiOperation({ summary: 'List reported comments for admin review' })
  async getFlagged() {
    return this.commentsService.findAllFlagged();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Patch(':id/moderate')
  @ApiOperation({ summary: 'Moderate comment status (Admin only)' })
  async moderate(
    @Param('id') id: string,
    @Body('status') status: CommentStatus,
  ) {
    return this.commentsService.moderate(id, status);
  }
}
