import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [TasksModule],
  controllers: [HealthController],
})
export class AppModule {}
