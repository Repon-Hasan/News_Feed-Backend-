import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { Public } from '../common/decorators/public.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

class SubscribeNewsletterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

@ApiTags('Newsletter')
@Controller('v1/newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Public()
  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to newsletter with email' })
  async subscribe(@Body() dto: SubscribeNewsletterDto) {
    return this.newsletterService.subscribe(dto.email);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @Get('subscribers')
  @ApiOperation({ summary: 'Get newsletter subscriber list (Admin only)' })
  async getSubscribers() {
    return this.newsletterService.getAllSubscribers();
  }
}
