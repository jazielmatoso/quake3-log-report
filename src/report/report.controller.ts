import { Controller, Get, Inject, Res } from '@nestjs/common';
import { ReportService } from './report.service';
import { Response } from 'express';

@Controller('report')
export class ReportController {
  @Inject(ReportService) public reportService: ReportService;

  @Get('/kills')
  async getKills(@Res() res: Response) {
    this.reportService.getKillData(function (obj: any) {
      res.status(200).send(obj);
    });
  }

  @Get('/deaths')
  async getDeaths(@Res() res: Response) {
    this.reportService.getDeathData(function (obj: any) {
      res.status(200).send(obj);
    });
  }
}
