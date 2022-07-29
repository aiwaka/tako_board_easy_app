<template>
  <!-- Firestore検索クエリを作成し取得ボタンを押したらコールバックに渡す -->
  <div class="query-maker">
    <date-selector-vue
      v-on:end-date-changed="endDateChanged"
      v-on:start-date-changed="startDateChanged"
    />
    <button @click="fetch" :disabled="fetchButtonDisabled">取得</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs, reactive, onMounted, PropType } from "vue";
import { toDateString } from "@/composables/utils";

import DateSelectorVue from "@/components/DateSelector.vue";

const today = new Date();
const tempToday = new Date();
const prevWeekDay = new Date(tempToday.setDate(tempToday.getDate() - 7));

interface State {
  endDate: string;
  fetchButtonDisabled: boolean;
  startDate: string;
}

export default defineComponent({
  components: { DateSelectorVue },
  props: {
    fetchCallback: {
      type: Function as PropType<{
        (startDate: string, endDate: string): Promise<void>;
      }>,
      required: true,
    },
  },
  setup(props) {
    const { endDate, fetchButtonDisabled, startDate } = toRefs(
      reactive<State>({
        endDate: toDateString(today),
        fetchButtonDisabled: true,
        startDate: toDateString(prevWeekDay),
      })
    );
    onMounted(() => props.fetchCallback(startDate.value, endDate.value));

    const fetch = async () => {
      // 開始終了期間を受け取ってレコードリストを取得する関数をpropsで取っておいて実行する.
      await props.fetchCallback(startDate.value, endDate.value);
      fetchButtonDisabled.value = true;
    };

    // 表示日が初期状態から変更された場合, レコード再取得ボタンを有効化する.
    const endDateChanged = (newDate: string) => {
      endDate.value = newDate;
      fetchButtonDisabled.value = false;
    };
    const startDateChanged = (newDate: string) => {
      startDate.value = newDate;
      fetchButtonDisabled.value = false;
    };

    return {
      endDate,
      endDateChanged,
      fetch,
      fetchButtonDisabled,
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
