import { Timestamp } from "@firebase/firestore";

const dayStr = ["日", "月", "火", "水", "木", "金", "土"];
export const recordTypeStr = [
  "コメントのみ",
  "草",
  "ペレット",
  "水",
  "トイレ掃除",
  "簡易トイレ掃除",
  "散歩",
];

export class Record {
  constructor(
    public id: string,
    public userId: string,
    public who: string,
    public type: number,
    public date: Timestamp,
    public comment: string
  ) {}
  public getDate(): string {
    const dateObj: Date = this.date.toDate();
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1; // getMonthは0始まり
    const date = dateObj.getDate();
    const hour = dateObj.getHours();
    const minute = dateObj.getMinutes();
    const second = dateObj.getSeconds();
    const day = dayStr[dateObj.getDay()];
    return `${year}年${month}月${date}日（${day}） ${hour}時${minute}分${second}秒`;
  }
  public getTime(): string {
    const dateObj: Date = this.date.toDate();
    const hour = dateObj.getHours();
    const minute = dateObj.getMinutes();
    // const second = dateObj.getSeconds();
    return `${hour}時${minute}分`;
  }
  public getType(): string {
    return recordTypeStr[this.type];
  }
}
