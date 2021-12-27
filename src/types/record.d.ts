import { Timestamp } from "@firebase/firestore";

export interface RecordData {
  id: string;
  userId: string;
  who: string;
  type: number;
  date: Timestamp;
  comment: string;
}
