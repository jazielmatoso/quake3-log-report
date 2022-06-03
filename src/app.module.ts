import { Module } from '@nestjs/common';
import { ReportModule } from './report/report.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
    }),
    ReportModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
