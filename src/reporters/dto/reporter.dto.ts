import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReporterProfileDto {
  @ApiPropertyOptional({ example: 'বরিষ্ঠ রাজনৈতিক প্রতিবেদক' })
  @IsString()
  @IsOptional()
  designation?: string;

  @ApiPropertyOptional({ example: '১০ বছরের বেশি সময় ধরে জাতীয় রাজনীতি ও সংসদ নিয়ে প্রতিবেদন করছেন।' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: '+8801700000000' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://twitter.com/reporter' })
  @IsString()
  @IsOptional()
  twitter?: string;

  @ApiPropertyOptional({ example: 'https://facebook.com/reporter' })
  @IsString()
  @IsOptional()
  facebook?: string;
}
