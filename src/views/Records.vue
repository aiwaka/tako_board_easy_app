<template>
  <div class="record-container">
    <!-- <div>{{ state.records }}</div> -->
    <div class="record-container__day-selector">
      <input type="date" v-model="startDate" />
      から
      <input type="date" v-model="endDate" />
      <button @click="reAcquire">取得</button>
    </div>
    <div>
      <label>
        タイプ
        <select name="type" v-model="type">
          <option value="-1">---</option>
          <option value="0">草</option>
          <option value="1">ペレット</option>
          <option value="2">トイレ掃除</option>
        </select>
      </label>
      <label>
        コメント
        <input
          type="text"
          name="comment"
          placeholder="comment"
          v-model="comment"
        />
      </label>
      <button @click.prevent="addRecord">追加</button>
    </div>
    <table class="record-table">
      <thead>
        <tr>
          <th colspan="6">リスト</th>
        </tr>
      </thead>
      <tbody>
        <record-row
          v-for="record in records"
          :key="record.id"
          :data="record"
          @delete-record="deleteRecord"
        />
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted, toRefs } from "vue";
import { Record } from "@/modules/record";
import getRecordsList from "@/composables/get-records-list";
import addRecordToFirestore from "@/composables/add-record";
import deleteRecordFromFirestore from "@/composables/delete-record";
import RecordRow from "@/components/RecordRow.vue";

interface State {
  records: Record[];
  type: number;
  comment: string;
  startDate: string;
  endDate: string;
}

const today = new Date();
const tempToday = new Date();
const prevWeekDay = new Date(tempToday.setDate(tempToday.getDate() - 7));

const toDateString = (date: Date): string => {
  // input[type='date']で用いる日付文字列に変換する
  return `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${(
    "0" + date.getDate()
  ).slice(-2)}`;
};

export default defineComponent({
  components: { RecordRow },
  setup() {
    const { records, type, comment, startDate, endDate } = toRefs(
      reactive<State>({
        records: [],
        type: -1,
        comment: "",
        startDate: toDateString(prevWeekDay),
        endDate: toDateString(today),
      })
    );

    onMounted(getRecordsList(records, prevWeekDay, today));

    const reAcquire = async () => {
      records.value = [];
      await getRecordsList(
        records,
        new Date(startDate.value),
        new Date(endDate.value)
      )();
    };

    const addRecord = async () => {
      const addedRecord = await addRecordToFirestore(type.value, comment.value);
      if (addedRecord) {
        records.value.splice(0, 0, addedRecord);
      }
    };
    const deleteRecord = async (id: string) => {
      if (confirm("削除しますか？")) {
        await deleteRecordFromFirestore(id);
        await reAcquire();
      }
    };

    return {
      records,
      type,
      comment,
      addRecord,
      deleteRecord,
      startDate,
      endDate,
      reAcquire,
    };
  },
});
</script>

<style lang="scss" scoped>
.record-table {
  width: 90%;
  height: auto;
  margin: 30px auto;
  overflow-x: scroll;
}
.record-container__day-selector {
  display: flex;
  justify-content: center;
  > input {
    margin: auto 15px;
  }
}
</style>
