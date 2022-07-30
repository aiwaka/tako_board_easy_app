<template>
  <!-- Firestore検索クエリを作成し取得ボタンを押したらコールバックに渡す -->
  <div class="query-maker">
    <date-selector-vue
      v-on:end-date-changed="endDateChanged"
      v-on:start-date-changed="startDateChanged"
    />
    タイプ指定：
    <select
      name="query-record-type"
      v-model="recordType"
      v-on:change="recordTypeChanged"
    >
      <option value="-1">---</option>
      <option
        v-for="(type, index) in recordTypeStr"
        :key="type"
        :value="'' + index"
      >
        <!-- valueをバインドする際は-1に合わせるためstringに変換している. -->
        {{ type }}
      </option>
    </select>
    <button @click="fetch" :disabled="fetchButtonDisabled">取得</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs, reactive, onMounted, PropType } from "vue";
import {
  endAt,
  orderBy,
  startAt,
  QueryConstraint,
  where,
} from "@firebase/firestore";
import { toDateString } from "@/composables/utils";

import { recordTypeStr } from "@/modules/record";
import DateSelectorVue from "@/components/DateSelector.vue";

const today = new Date();
const tempToday = new Date();
const prevWeekDay = new Date(tempToday.setDate(tempToday.getDate() - 7));

interface State {
  endDate: string;
  fetchButtonDisabled: boolean;
  recordType: string;
  startDate: string;
}

export default defineComponent({
  components: { DateSelectorVue },
  props: {
    fetchCallback: {
      type: Function as PropType<{
        (queries: QueryConstraint[]): Promise<void>;
      }>,
      required: true,
    },
  },
  setup(props) {
    const { endDate, fetchButtonDisabled, startDate, recordType } = toRefs(
      reactive<State>({
        endDate: toDateString(today),
        fetchButtonDisabled: true,
        recordType: "-1",
        startDate: toDateString(prevWeekDay),
      })
    );
    onMounted(() => fetch());

    const fetch = async () => {
      // 取得時期期間, 検索条件等を総合したクエリを作成し, propsで受け取っているコールバックに渡しながら実行
      // 降順の場合startとendが逆になる.
      const queries = [
        orderBy("date", "desc"),
        endAt(new Date(startDate.value)),
        startAt(new Date(endDate.value)),
      ];
      if (recordType.value !== "-1") {
        queries.push(where("type", "==", parseInt(recordType.value)));
      }
      fetchButtonDisabled.value = true;
      await props.fetchCallback(queries);
    };

    // 表示日が初期状態から変更された場合, レコード再取得ボタンを有効化する.
    const endDateChanged = (newDate: string) => {
      endDate.value = newDate;
      recordTypeChanged();
    };
    const startDateChanged = (newDate: string) => {
      startDate.value = newDate;
      recordTypeChanged();
    };
    const recordTypeChanged = () => {
      fetchButtonDisabled.value = false;
    };

    return {
      endDate,
      endDateChanged,
      fetch,
      fetchButtonDisabled,
      recordType,
      recordTypeChanged,
      recordTypeStr,
      startDate,
      startDateChanged,
    };
  },
});
</script>

<style lang="scss" scoped>
.date-selector {
  display: flex;
  justify-content: center;
  > input {
    margin: auto 15px;
  }
}
</style>
