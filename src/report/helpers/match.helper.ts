import { RegexpHelper } from './regexp.helper';

export class MatchHelper {
  private static worldKiller = 'world>';

  public static verifyInitMatch(row: string): boolean {
    return RegexpHelper.getInitMatch().test(row);
  }

  public static getKillData(row: string): any[] | boolean {
    const matches = row.match(RegexpHelper.getRegexpKill());
    if (matches) {
      matches.shift();
      return matches;
    }

    return false;
  }

  public static verifyKillerIsWorld(killer: string): boolean {
    return killer === this.worldKiller;
  }

  public static getClientUserinfoChanged(row: string): string {
    const matches = row.match(
      new RegExp(/ClientUserinfoChanged:\s\d+\sn[\\](.*)[\\]t\\/),
    );
    if (matches) {
      matches.shift();
      return matches.shift();
    }
    return '';
  }
}
