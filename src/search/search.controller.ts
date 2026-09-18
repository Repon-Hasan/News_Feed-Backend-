import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Search')
@Controller('v1/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Global search articles by title, excerpt, content, or author' })
  async search(
    @Query('q') q = '',
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '12',
  ) {
    return this.searchService.search(
      q,
      category,
      tag,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }
}
