<template>
  <div class="record">
    <div class="who">{{ data.who }}</div>
    <div class="date">{{ data.getDate() }}</div>
    <div class="type">{{ data.getType() }}</div>
    <button>x</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, onMounted } from "vue";
import { Record } from "@/modules/record";

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<Record>,
      required: true,
    },
  },
  setup(props) {
    onMounted(() => {
      console.log(props.data);
    });
  },
});
</script>

<style lang="scss" scoped>
.record {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  width: 80%;
  margin: auto auto;

  > div {
    margin: auto 12px;
  }
}
</style>
