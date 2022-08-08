<template>
  <div class="records-view">
    <div class="input-search-box-container">
      <h4>入力・検索</h4>
      <record-input-box @record-added="recordAdded" />
      <query-maker :fetch-callback="acquireList" />
    </div>
    <div class="record-list-container">
      <!-- レコードリスト -->
      <h4>リスト</h4>
      <record-list-vue :records="records" @delete-record="deleteRecord" />
    </div>
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
.records-view {
  margin: 0px max(2.6rem, 10%);

  .record-list-container {
    margin-top: 3rem;
  }

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
