<template>
  <div class="record-container">
    <!-- <div>{{ state.records }}</div> -->
    <record-item v-for="record in records" :key="record.id" :data="record" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted, toRefs } from "vue";
import { Record } from "@/modules/record";
import getRecordsList from "@/composables/get-records-list";
import RecordItem from "@/components/RecordItem.vue";

interface State {
  records: Array<Record>;
}

export default defineComponent({
  components: { RecordItem },
  setup() {
    const state = reactive<State>({
      records: [],
    });

    const { records } = toRefs(state);
    onMounted(getRecordsList(records));

    return { records };
  },
});
</script>

<style lang="scss" scoped></style>
