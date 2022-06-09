import {
  collectionGroup,
  getDocs,
  query,
  orderBy,
  startAt,
  endAt,
} from "@firebase/firestore";
import { Ref } from "vue";
import { db, getCurrentUser } from "@/settings/firebase";
import { Record } from "@/modules/record";
import { recordConverter } from "./record-firestore-converter";

export const getRecordsList = (
  records: Ref<Record[]>,
  startDay: Date,
  endDay: Date
): (() => Promise<void>) => {
  const targetDayStart = new Date(startDay.setHours(0, 0, 0, 0));
  const targetDayEnd = new Date(endDay.setHours(24, 0, 0, 0));
  // リアクティブなRecordリストの参照を受け取って中身を追加する
  const getRecordsList = async () => {
    // fetch data from firestore
    const user = await getCurrentUser();
    const uid = user?.uid;
    if (!uid) return;
    // 降順の場合startとendが逆になる.
    const recordsQuery = query(
      collectionGroup(db, "records").withConverter(recordConverter),
      orderBy("date", "desc"),
      endAt(targetDayStart),
      startAt(targetDayEnd)
    );
    const querySnapshot = await getDocs(recordsQuery);
    querySnapshot.forEach((doc) => {
      records.value.push(doc.data());
    });
  };
  return getRecordsList;
};
