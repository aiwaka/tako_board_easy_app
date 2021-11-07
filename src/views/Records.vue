<template>
  <div class="record-container">
    <!-- <div>{{ state.records }}</div> -->
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
    <!-- <div>
      <record-row v-for="record in records" :key="record.id" :data="record" />
    </div> -->
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
import { defineComponent, reactive, onMounted, toRefs } from "vue";
import { Record } from "@/modules/record";
import getRecordsList from "@/composables/get-records-list";
import addRecordToFirestore from "@/composables/add-record";
import RecordRow from "@/components/RecordRow.vue";

interface State {
  records: Record[];
  type: number;
  comment: string;
}

export default defineComponent({
  components: { RecordRow },
  setup() {
    const { records, type, comment } = toRefs(
      reactive<State>({
        records: [],
        type: -1,
        comment: "",
      })
    );
    onMounted(getRecordsList(records));

    const addRecord = async () => {
      const addedRecord = await addRecordToFirestore(type.value, comment.value);
      if (addedRecord) {
        records.value.push(addedRecord);
      }
    };

    return { records, type, comment, addRecord };
  },
});
</script>

<style lang="scss" scoped>
.record-table {
  width: 80%;
  margin: auto;
}
</style>
