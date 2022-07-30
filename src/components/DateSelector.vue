<template>
  <div class="date-selector">
    <input type="date" v-model="startDate" @change="startDateChanged" />
    から
    <input type="date" v-model="endDate" @change="endDateChanged" />
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs, reactive } from "vue";
import { toDateString } from "@/composables/utils";

const today = new Date();
const tempToday = new Date();
const prevWeekDay = new Date(tempToday.setDate(tempToday.getDate() - 7));

interface State {
  endDate: string;
  startDate: string;
}

export default defineComponent({
  emits: ["end-date-changed", "start-date-changed"],
  setup(_, context) {
    const { endDate, startDate } = toRefs(
      reactive<State>({
        endDate: toDateString(today),
        startDate: toDateString(prevWeekDay),
      })
    );

    const endDateChanged = () => {
      context.emit("end-date-changed", endDate.value);
    };
    const startDateChanged = () => {
      context.emit("start-date-changed", startDate.value);
    };

    return { endDate, endDateChanged, startDate, startDateChanged };
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
