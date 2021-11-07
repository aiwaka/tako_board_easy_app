<template>
  <tr class="record">
    <td class="who">{{ data.who }}</td>
    <td class="date">{{ data.getTime() }}</td>
    <td class="type">{{ data.getType() }}</td>
    <button>x</button>
  </tr>
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
  width: 100%;

  > td {
    width: 200px;
  }
}
</style>
