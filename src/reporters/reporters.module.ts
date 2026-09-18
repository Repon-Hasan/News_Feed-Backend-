import { Module } from '@nestjs/common';
import { ReportersService } from './reporters.service';
import { ReportersController } from './reporters.controller';

@Module({
  controllers: [ReportersController],
  providers: [ReportersService],
  exports: [ReportersService],
})
export class ReportersModule {}
