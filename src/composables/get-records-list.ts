import { collection, getDocs, doc } from "@firebase/firestore";
import { Ref } from "vue";
import { db, getCurrentUser } from "@/settings/firebase";
import { Record } from "@/modules/record";

// const recordConverter = {
//   toFirestore: (record: Record) => {
//     return {
//       type: record.type,
//       date: record.date,
//       comment: record.comment,
//     };
//   },
//   fromFirestore: (
//     snapshot: QueryDocumentSnapshot,
//     options: SnapshotOptions
//   ): Record => {
//     const data = snapshot.data(options);
//     return new Record(data.type, data.date, data.comment);
//   },
// };

export default (records: Ref<Record[]>): (() => Promise<void>) => {
  const getRecordsList = async () => {
    // fetch data from firestore
    const user = await getCurrentUser();
    const uid = user?.uid;
    console.log(uid);
    if (uid) {
      // const userDb = doc(db, "users", uid);
      const userQuerySnapshot = await getDocs(collection(db, "users"));
      const userIdList: Array<string> = [];
      userQuerySnapshot.forEach((userQuery) => {
        userIdList.push(userQuery.id);
      });
      for (const userId of userIdList) {
        const recordsRef = doc(db, "users", userId);
        // .withConverter(recordConverter);
        const recordQuerySnapshot = await getDocs(
          collection(recordsRef, "records")
        );
        recordQuerySnapshot.forEach((doc) => {
          const docData = doc.data();
          const newRec = new Record(
            doc.id,
            userId,
            docData.type,
            docData.date,
            docData.comment
          );
          records.value.push(newRec);
        });
      }
    }
  };
  return getRecordsList;
};
