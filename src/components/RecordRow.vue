<template>
  <tr class="record">
    <td class="who">{{ data.who }}</td>
    <td class="day">{{ data.date.toDate().getDate() }}日</td>
    <td class="date">{{ data.getTime() }}</td>
    <td class="type">{{ data.getType() }}</td>
    <td
      class="comment"
      v-if="commentIsLong && !showWholeComment"
      @click="toggleShowComment"
    >
      {{ shortComment }}
    </td>
    <td class="comment" v-else @click="toggleShowComment">
      {{ data.comment }}
    </td>
    <td class="button">
      <button :disabled="deleteDisabled" @click="deleteRecord">x</button>
    </td>
  </tr>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  onMounted,
  computed,
  toRefs,
  reactive,
} from "vue";
import { getCurrentUser } from "@/settings/firebase";
import { Record } from "@/modules/record";

interface State {
  deleteDisabled: boolean;
  showWholeComment: boolean;
}

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<Record>,
      required: true,
    },
  },
  emits: ["delete-record"],
  setup(props, context) {
    const { deleteDisabled, showWholeComment } = toRefs(
      reactive<State>({
        deleteDisabled: true,
        showWholeComment: false,
      })
    );
    onMounted(async () => {
      const user = await getCurrentUser();
      const uid = user?.uid;
      if (uid) {
        deleteDisabled.value = uid !== props.data.userId;
      }
    });
    const omitThreshold = 8; // コメント文字列を省略する文字数の閾値
    const commentIsLong = computed(
      () => props.data.comment.length > omitThreshold
    );
    const shortComment = computed(
      () => props.data.comment.substr(0, omitThreshold) + "..."
    );
    const toggleShowComment = () => {
      showWholeComment.value = !showWholeComment.value;
    };
    const deleteRecord = () => {
      context.emit("delete-record", props.data.id);
    };
    return {
      deleteDisabled,
      showWholeComment,
      commentIsLong,
      shortComment,
      toggleShowComment,
      deleteRecord,
    };
  },
});
</script>

<style lang="scss" scoped>
tr.record {
  width: 100%;
  > td {
    width: 200px;
    max-width: 25%;
    &.comment {
      max-width: 40%;
      width: 300px;
    }
  }
}
</style>
