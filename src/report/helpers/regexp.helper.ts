export class RegexpHelper {
  public static getRegexpKill(): RegExp {
    return new RegExp(
      /Kill:[\s\d{1,4}]+:\s[<]?(.*)[>]?\skilled\s(.*)\sby\s(.*)/,
    );
  }

  public static getInitMatch(): RegExp {
    return new RegExp(/InitGame/);
  }

  public static getRegexpClientUserinfoChanged(): RegExp {
    return new RegExp(/ClientUserinfoChanged:\s\d+\sn[\\](.*)[\\]t\\/);
  }
}
