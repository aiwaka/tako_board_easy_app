<template>
  <table v-if="records.length !== 0" class="record-table">
    <!-- <thead>
      <tr>
        <th colspan="6">リスト</th>
      </tr>
    </thead> -->
    <tbody>
      <record-row-vue
        v-for="record in records"
        :key="record.id"
        :data="record"
        @delete-record="deleteRecord"
      />
    </tbody>
  </table>
  <div v-else>
    <span>レコードがありません</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { deleteRecordFromFirestore } from "@/composables/delete-record";
import { Record } from "@/modules/record";
import RecordRowVue from "@/components/RecordRow.vue";

export default defineComponent({
  components: { RecordRowVue },
  emits: ["delete-record"],
  props: {
    records: {
      type: Array as PropType<Record[]>,
      required: true,
    },
  },
  setup(props, context) {
    const deleteRecord = async (id: string) => {
      if (confirm("削除しますか？")) {
        await deleteRecordFromFirestore(id);
        const index = props.records.findIndex((rec) => rec.id === id);
        if (index !== -1) {
          context.emit("delete-record", index);
        }
      }
    };
    return { deleteRecord };
  },
});
</script>

<style lang="scss" scoped>
.record-table {
  width: 90%;
  height: auto;
  margin: 30px auto;
  overflow-x: scroll;
  border-collapse: separate;
  border-spacing: 0px 30px;
}
</style>
