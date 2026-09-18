import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Likes')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('v1/articles/:id/like')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Get()
  @ApiOperation({ summary: 'Check if current user liked this article' })
  async checkLike(
    @CurrentUser('id') userId: string,
    @Param('id') articleId: string,
  ) {
    return this.likesService.checkLike(userId, articleId);
  }

  @Post()
  @ApiOperation({ summary: 'Like article' })
  async addLike(
    @CurrentUser('id') userId: string,
    @Param('id') articleId: string,
  ) {
    return this.likesService.addLike(userId, articleId);
  }

  @Delete()
  @ApiOperation({ summary: 'Unlike article' })
  async removeLike(
    @CurrentUser('id') userId: string,
    @Param('id') articleId: string,
  ) {
    return this.likesService.removeLike(userId, articleId);
  }
}
