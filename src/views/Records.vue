<template>
  <div class="record-container">
    <record-input-box @record-added="recordAdded" />
    <query-maker :fetch-callback="acquireList" />

    <!-- レコードリスト -->
    <record-list-vue :records="records" @delete-record="deleteRecord" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from "vue";
import { Record, recordTypeStr } from "@/modules/record";
import { getRecordsList } from "@/composables/get-records-list";
import RecordListVue from "@/components/RecordList.vue";
import QueryMaker from "@/components/QueryMaker.vue";
import { QueryConstraint } from "@firebase/firestore";
import RecordInputBox from "@/components/RecordInputBox.vue";

interface State {
  records: Record[];
}

export default defineComponent({
  components: {
    RecordListVue,
    QueryMaker,
    RecordInputBox,
  },
  setup() {
    const { records } = toRefs(
      reactive<State>({
        records: [],
      })
    );

    // レコードリストを取得. クエリメーカーで作成されたクエリを渡してもらう.
    const acquireList = async (queries: QueryConstraint[]) => {
      records.value = [];
      await getRecordsList(records, queries)();
    };

    const recordAdded = (addedRecord: Record) => {
      records.value.splice(0, 0, addedRecord);
    };

    const deleteRecord = async (index: number) => {
      records.value.splice(index, 1);
    };

    return {
      acquireList,
      deleteRecord,
      recordAdded,
      records,
      recordTypeStr,
    };
  },
});
</script>

<style lang="scss" scoped>
.record-container {
  margin: 0px max(2.6rem, 10%);

  .input-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    > div {
      width: 50%;
      display: flex;
      justify-content: left;
    }
  }
}
</style>
