import { Timestamp } from "@firebase/firestore";

export interface RecordData {
  who: string;
  type: number;
  date: Timestamp;
  comment: string;
}
