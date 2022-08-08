<template>
  <!-- 任意時刻を指定できるボックス. 反映されるか否かはボックスを開いているか否かのみに依存する. -->
  <div class="arbitrary-time-input">
    <div v-if="!active">
      <div class="arbitrary-time-input__button" @click="toggleActive">+</div>
      <span>任意の時刻を入力</span>
    </div>
    <div v-else>
      <div class="arbitrary-time-input__button" @click="toggleActive">-</div>
      <label>日付</label>
      <datepicker
        class="date-picker"
        startingView="day"
        minimumView="day"
        inputFormat="yyyy-MM-dd"
        v-model="pickedDate"
      />
      <label>時刻</label>
      <datepicker
        class="date-picker"
        startingView="time"
        minimumView="time"
        inputFormat="HH:mm"
        v-model="pickedTime"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watch, toRefs } from "vue";
import { toDateString, toTimeString } from "@/composables/utils";
import Datepicker from "vue3-datepicker";

interface State {
  active: boolean; // 任意時刻入力が有効かどうか
  inputDate: string; // 任意時刻入力のための日付文字列
  inputTime: string; // 上と同様の時刻文字列
  pickedDate: Date;
  pickedTime: Date;
}

export default defineComponent({
  components: { datepicker: Datepicker },
  emits: ["input-time-changed", "toggle-active"],
  setup(_, context) {
    const { active, inputDate, inputTime, pickedDate, pickedTime } = toRefs(
      reactive<State>({
        active: false,
        inputDate: toDateString(new Date()),
        inputTime: toTimeString(new Date()),
        pickedDate: new Date(),
        pickedTime: new Date(),
      })
    );

    const toggleActive = () => {
      active.value = !active.value;
      context.emit("toggle-active");
    };

    watch([pickedDate, pickedTime], () => {
      context.emit("input-time-changed", getArbitTimeAsDate());
    });

    const getArbitTimeAsDate = () => {
      // 外部パッケージを用いて取得した日時を一つのDateオブジェクトにして返す.
      const date = pickedDate.value;
      const time = pickedTime.value;
      return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes()
      );
    };
    return {
      active,
      inputDate,
      inputTime,
      pickedDate,
      pickedTime,
      toggleActive,
    };
  },
});
</script>

<style lang="scss" scoped>
.arbitrary-time-input {
  border: 1px solid #777;
  margin: 0.6rem auto;
  padding: 1rem 0.6rem;

  &__button {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    line-height: 1rem;
    border: 1px solid #000;
    cursor: pointer;
  }
  span {
    margin: 0 0.5rem;
  }
  .date-picker input {
    // width: 7rem;
    margin: auto 1.8rem;
  }
}
</style>
