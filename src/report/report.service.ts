import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, ReadStream } from 'fs';
import { join } from 'path';
import { MeansOfDeath } from './enums/means-of-death.enum';
import { ReportType } from './enums/report-type.enum';

import { MatchHelper } from './helpers/match.helper';
import { MatchDeathInterface } from './interfaces/match-death.interface';
import { MatchKillInterface } from './interfaces/match-kill.interface';

@Injectable()
export class ReportService {
  @Inject(ConfigService) public configService: ConfigService;

  private streamFile: ReadStream;
  private matchesObj = Object.assign({}, Array);
  private matchCount = 0;
  private killDataCount = 0;
  private killObj = Object.assign({}, Array);
  private players = [];
  private matchKill: MatchKillInterface;
  private matchDeath: MatchDeathInterface;
  private deathObj = Object.assign({}, Array);

  private resetMatchObj(): void {
    this.matchKill = {
      total_kills: 0,
      players: [],
      kills: {},
    };

    this.matchDeath = {
      kills_by_means: {},
    };
  }

  private initMatch(): void {
    this.matchCount++;
    this.killDataCount = 0;
    this.killObj = Object.assign({}, Array);
    this.deathObj = Object.assign({}, Array);
    this.players = [];
    this.resetMatchObj();
  }

  private addPlayer(player: string): void {
    if (player !== '') {
      this.players[player] = player;
      this.matchKill.players = Object.keys(this.players);
      this.initKillRanking(player);
    }
  }

  private initKillRanking(player): void {
    if (!this.killObj[player]) {
      this.killObj[player] = 0;
      this.matchKill.kills = this.killObj;
    }
  }

  private clearReturnObjs(): void {
    this.matchCount = 0;
    this.matchesObj = Object.assign({}, Array);
    this.matchesObj = Object.assign({}, Array);
    this.matchCount = 0;
    this.killDataCount = 0;
    this.killObj = Object.assign({}, Array);
    this.players = [];
    this.resetMatchObj();
    this.deathObj = Object.assign({}, Array);
  }

  private addKill(player: string): void {
    this.killObj[player] = this.killObj[player] ? this.killObj[player] + 1 : 1;
  }

  private removeKill(player: string): void {
    this.killObj[player] = this.killObj[player] ? this.killObj[player] - 1 : -1;
  }

  private joinKillData(killData: any[]): void {
    const [killer, dead] = killData;
    if (MatchHelper.verifyKillerIsWorld(killer)) {
      this.addPlayer(dead);
      this.removeKill(dead);
    } else if (killer !== dead) {
      this.addPlayer(killer);
      this.addKill(killer);
    }
    this.killDataCount++;
    this.matchKill.kills = this.killObj;
    this.matchKill.total_kills = this.killDataCount;
  }

  private loadStream(): void {
    this.streamFile = createReadStream(
      join(process.cwd(), this.configService.get('QUAKE_LOG')),
    );
  }

  private processKillData(rows: any[]): void {
    if (rows) {
      rows.map((row) => {
        if (MatchHelper.verifyInitMatch(row)) {
          this.initMatch();
        }
        const getPlayerName = MatchHelper.getClientUserinfoChanged(row);
        this.addPlayer(getPlayerName);

        const killData = MatchHelper.getKillData(row);
        if (killData) {
          this.joinKillData(killData as any[]);
        }
        if (this.matchKill.players.length > 0) {
          this.matchesObj[`game_${this.matchCount}`] = this.matchKill;
        }
      });
    }
  }

  private processDeathData(rows: any[]): void {
    if (rows) {
      let init = false;
      rows.map((row) => {
        if (MatchHelper.verifyInitMatch(row)) {
          init = true;
          this.initMatch();
        }
        const killData = MatchHelper.getKillData(row);
        if (killData) {
          const modKill = (killData as any[]).pop();
          if (Object.values(MeansOfDeath).includes(modKill)) {
            this.deathObj[modKill] = this.deathObj[modKill]
              ? this.deathObj[modKill] + 1
              : 1;
            this.matchDeath.kills_by_means = this.deathObj;
          }
        }
        if (init) {
          this.matchesObj[`game_${this.matchCount}`] = this.matchDeath;
        }
      });
    }
  }

  private processStreamData(callback: any, type: ReportType): void {
    this.streamFile.on('readable', () => {
      let dataChunck;
      while ((dataChunck = this.streamFile.read()) !== null) {
        const rows = dataChunck.toString().split('\n');
        switch (type) {
          case ReportType.KILLS:
            this.processKillData(rows);
            break;
          case ReportType.DEATHS:
            this.processDeathData(rows);
            break;
        }
      }
    });

    this.streamFile.on('end', () => {
      callback(this.matchesObj);
    });
  }

  public getKillData(callback: any): void {
    this.clearReturnObjs();
    this.loadStream();
    this.processStreamData(callback, ReportType.KILLS);
  }

  public getDeathData(callback: any): void {
    this.clearReturnObjs();
    this.loadStream();
    this.processStreamData(callback, ReportType.DEATHS);
  }
}
