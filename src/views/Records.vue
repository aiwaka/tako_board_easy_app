<template>
  <div class="record-container">
    <div>{{ state.records }}</div>
    <div v-for="record in state.records" :key="record.id">
      {{ record.date.toDate() }}
    </div>
  </div>
</template>

<script lang="ts">
import {
  Timestamp,
  collection,
  getDocs,
  doc,
  // QueryDocumentSnapshot,
  // SnapshotOptions,
} from "@firebase/firestore";
import { defineComponent, reactive, onMounted } from "vue";
import { db, getCurrentUser } from "@/settings/firebase";

class Record {
  constructor(
    public type: number,
    public date: Timestamp,
    public comment: string
  ) {}
  getDate() {
    const dateObj: Date = this.date.toDate();
    return dateObj;
  }
}
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

interface State {
  records: Array<Record>;
}

export default defineComponent({
  setup() {
    const state = reactive<State>({
      records: [],
    });

    onMounted(async () => {
      // alert("mounted");
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
              docData.type,
              docData.date,
              docData.comment
            );
            state.records.push(newRec);
          });
        }
      }
    });

    return { state };
  },
});
</script>

<style lang="scss" scoped></style>
