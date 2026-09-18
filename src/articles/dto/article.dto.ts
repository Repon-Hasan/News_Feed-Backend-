import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
  IsInt,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus } from '@prisma/client';

export class CreateArticleDto {
  @ApiProperty({ example: 'ঢাকা আন্তর্জাতিক বাণিজ্য মেলা শুরু হচ্ছে আগামী মাসে' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'dhaka-trade-fair-next-month' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 'রাজধানীর পূর্বাচলে মাসব্যাপী এই বাণিজ্য মেলার প্রস্তুতি প্রায় সম্পন্ন।' })
  @IsString()
  @IsNotEmpty()
  excerpt: string;

  @ApiProperty({ example: '<p>বিস্তারিত প্রতিবেদন এখানে...</p>' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverImageCaption?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  subcategoryId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @IsOptional()
  readingTime?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  seoDescription?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isBreaking?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

export class UpdateArticleDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverImageCaption?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  subcategoryId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  readingTime?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  seoDescription?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isBreaking?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isTrending?: boolean;
}

export class ArticleFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({ enum: ArticleStatus })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 12;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isBreaking?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isTrending?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class RejectArticleDto {
  @ApiProperty({ example: 'উৎস ও তথ্যসূত্রের আরও স্পষ্ট উল্লেখ প্রয়োজন।' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
