import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'বাংলাদেশ ক্রিকেট' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'bangladesh-cricket' })
  @IsString()
  @IsNotEmpty()
  slug: string;
}
