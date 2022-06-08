<template>
  <div class="date-selector">
    <input type="date" v-model="startDate" @change="dateChanged" />
    から
    <input type="date" v-model="endDate" @change="dateChanged" />
    <button @click="fetch" :disabled="fetchButtonDisabled">取得</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs, reactive, onMounted, PropType } from "vue";
import { toDateString } from "@/composables/utils";

const today = new Date();
const tempToday = new Date();
const prevWeekDay = new Date(tempToday.setDate(tempToday.getDate() - 7));

interface State {
  endDate: string;
  fetchButtonDisabled: boolean;
  startDate: string;
}

export default defineComponent({
  props: {
    fetchCallback: {
      type: Object as PropType<{
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

    const dateChanged = () => {
      // 表示日が初期状態から変更された場合, レコード再取得ボタンを有効化する.
      fetchButtonDisabled.value = false;
    };

    return { dateChanged, endDate, fetch, fetchButtonDisabled, startDate };
  },
});
</script>
