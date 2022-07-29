import {
  collectionGroup,
  getDocs,
  query,
  QueryConstraint,
} from "@firebase/firestore";
import { Ref } from "vue";
import { db, getCurrentUser } from "@/settings/firebase";
import { Record } from "@/modules/record";
import { recordConverter } from "./record-firestore-converter";

export const getRecordsList = (
  records_ref: Ref<Record[]>,
  queries: QueryConstraint[]
): (() => Promise<void>) => {
  // リアクティブなRecordリストの参照を受け取って中身を追加する
  const getRecordsList = async () => {
    // fetch data from firestore
    const user = await getCurrentUser();
    const uid = user?.uid;
    if (!uid) return;
    const recordsQuery = query(
      collectionGroup(db, "records").withConverter(recordConverter),
      ...queries
    );
    const querySnapshot = await getDocs(recordsQuery);
    querySnapshot.forEach((doc) => {
      records_ref.value.push(doc.data());
    });
  };
  return getRecordsList;
};
