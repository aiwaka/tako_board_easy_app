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
          <th colspan="2">リスト</th>
        </tr>
      </thead>
      <tbody>
        <record-row v-for="record in records" :key="record.id" :data="record" />
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted, computed, toRefs } from "vue";
import { Record } from "@/modules/record";
import getRecordsList from "@/composables/get-records-list";
import addRecordToFirestore from "@/composables/add-record";
import RecordRow from "@/components/RecordRow.vue";

interface State {
  records: Record[];
  type: number;
  comment: string;
  startDate: string;
  endDate: string;
}

const today = new Date();
const todayYear = today.getFullYear();
const todayMonth = today.getMonth();
const todayDate = today.getDate();
const todayDay = today.getDay();

export default defineComponent({
  components: { RecordRow },
  setup() {
    const defaultDateString = `${todayYear}-${("0" + (todayMonth + 1)).slice(
      -2
    )}-${("0" + todayDate).slice(-2)}`;
    const { records, type, comment, startDate, endDate } = toRefs(
      reactive<State>({
        records: [],
        type: -1,
        comment: "",
        startDate: defaultDateString,
        endDate: defaultDateString,
      })
    );
    const displayDay = computed(
      () => ["日", "月", "火", "水", "木", "金", "土"][todayDay]
    );

    onMounted(getRecordsList(records, new Date(), new Date()));

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

    return {
      records,
      type,
      comment,
      addRecord,
      displayDay,
      startDate,
      endDate,
      reAcquire,
    };
  },
});
</script>

<style lang="scss" scoped>
.record-table {
  width: 80%;
  height: auto;
  margin: auto;
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
