<template>
  <div class="record">
    {{ data.who }}：{{ data.getDate() }}：{{ data.getType() }}
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

<style lang="scss" scoped></style>
