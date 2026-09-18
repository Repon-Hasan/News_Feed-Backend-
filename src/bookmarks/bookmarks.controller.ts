import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Bookmarks')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('v1')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get('bookmarks')
  @ApiOperation({ summary: 'Get all saved bookmarks for logged-in user' })
  async getMyBookmarks(@CurrentUser('id') userId: string) {
    return this.bookmarksService.getUserBookmarks(userId);
  }

  @Get('articles/:id/bookmark-status')
  @ApiOperation({ summary: 'Check bookmark status for an article' })
  async checkStatus(
    @CurrentUser('id') userId: string,
    @Param('id') articleId: string,
  ) {
    return this.bookmarksService.checkBookmark(userId, articleId);
  }

  @Post('articles/:id/bookmark')
  @ApiOperation({ summary: 'Save article to bookmarks' })
  async addBookmark(
    @CurrentUser('id') userId: string,
    @Param('id') articleId: string,
  ) {
    return this.bookmarksService.addBookmark(userId, articleId);
  }

  @Delete('articles/:id/bookmark')
  @ApiOperation({ summary: 'Remove article from bookmarks' })
  async removeBookmark(
    @CurrentUser('id') userId: string,
    @Param('id') articleId: string,
  ) {
    return this.bookmarksService.removeBookmark(userId, articleId);
  }
}
