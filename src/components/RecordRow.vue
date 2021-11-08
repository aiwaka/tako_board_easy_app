<template>
  <tr class="record">
    <td class="who">{{ data.who }}</td>
    <td class="day">{{ data.date.toDate().getDate() }}日</td>
    <td class="date">{{ data.getTime() }}</td>
    <td class="type">{{ data.getType() }}</td>
    <td class="comment">{{ data.comment }}</td>
    <button :disabled="deleteDisabled">x</button>
  </tr>
</template>

<script lang="ts">
import { defineComponent, PropType, onMounted, toRefs, reactive } from "vue";
// import { getCurrentUser } from "@/settings/firebase";
import { Record } from "@/modules/record";

interface State {
  deleteDisabled: boolean;
}

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<Record>,
      required: true,
    },
  },
  setup(props) {
    const { deleteDisabled } = toRefs(
      reactive<State>({
        deleteDisabled: true,
      })
    );
    onMounted(async () => {
      // console.log(props.data.who);
      // const user = await getCurrentUser();
      // const uid = user?.uid;
      // if (uid) {
      //   deleteDisabled.value = uid === props.data.who;
      // }
    });
    return { deleteDisabled };
  },
});
</script>

<style lang="scss" scoped>
.record {
  width: 100%;

  > td {
    width: 200px;
    max-width: 30%;
  }
}
</style>
