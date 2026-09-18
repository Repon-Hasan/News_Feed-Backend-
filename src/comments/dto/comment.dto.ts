import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'খুবই তথ্যবহুল ও সময়োপযোগী প্রতিবেদন।' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  articleId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  parentId?: string;
}

export class ReportCommentDto {
  @ApiProperty({ example: 'অপ্রাসঙ্গিক বা অবমাননাকর মন্তব্য।' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
