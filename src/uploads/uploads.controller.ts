import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

class UploadImageDto {
  @ApiProperty({ description: 'Base64 image data URI' })
  @IsString()
  @IsNotEmpty()
  image: string;
}

@ApiTags('Uploads')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.REPORTER, Role.ADMIN)
@ApiBearerAuth()
@Controller('v1/uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @ApiOperation({ summary: 'Upload image to Cloudinary (Reporter/Admin only)' })
  async uploadImage(@Body() dto: UploadImageDto) {
    return this.uploadsService.uploadImage(dto.image);
  }
}
