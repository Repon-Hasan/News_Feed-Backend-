import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'জাতীয়' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'bangladesh' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'দেশের সার্বিক সংবাদ ও ঘটনাবলী' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'জাতীয়' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'bangladesh' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateSubcategoryDto {
  @ApiProperty({ example: 'রাজনীতি' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'politics' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
