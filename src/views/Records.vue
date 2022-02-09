<template>
  <div class="record-container">
    <div class="login-name-display">
      {{ loginUserName }}としてログインしています。
    </div>
    <div class="record-container__day-selector">
      <input type="date" v-model="startDate" @change="dateChanged" />
      から
      <input type="date" v-model="endDate" @change="dateChanged" />
      <button @click="reAcquire" :disabled="fetchButtonDisabled">取得</button>
    </div>
    <div class="input-box">
      <div>
        <label>
          タイプ
          <select name="type" v-model="type">
            <option value="-1">---</option>
            <option
              v-for="(type, index) in recordTypeStr"
              :key="type"
              :value="'' + index"
            >
              <!-- valueをバインドする際は-1に合わせるためstringに変換している. -->
              {{ type }}
            </option>
          </select>
        </label>
      </div>
      <div>
        <label>
          コメント
          <input
            type="text"
            name="comment"
            placeholder="comment"
            v-model="comment"
          />
        </label>
      </div>
      <button
        class="add-button"
        @click.prevent="addRecord"
        :disabled="addButtonDisabled"
      >
        追加
      </button>
    </div>
    <table class="record-table">
      <thead>
        <tr>
          <th colspan="6">リスト</th>
        </tr>
      </thead>
      <tbody>
        <record-row
          v-for="record in records"
          :key="record.id"
          :data="record"
          @delete-record="deleteRecord"
        />
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted, computed, toRefs } from "vue";
import { Record, recordTypeStr } from "@/modules/record";
import getRecordsList from "@/composables/get-records-list";
import addRecordToFirestore from "@/composables/add-record";
import deleteRecordFromFirestore from "@/composables/delete-record";
import getUserName from "@/composables/get-username";
import RecordRow from "@/components/RecordRow.vue";

interface State {
  records: Record[];
  type: string;
  comment: string;
  startDate: string;
  endDate: string;
  loginUserName: string;
  fetchButtonDisabled: boolean;
}

const today = new Date();
const tempToday = new Date();
const prevWeekDay = new Date(tempToday.setDate(tempToday.getDate() - 7));

const toDateString = (date: Date): string => {
  // input[type='date']で用いる日付文字列に変換する
  return `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${(
    "0" + date.getDate()
  ).slice(-2)}`;
};

export default defineComponent({
  components: { RecordRow },
  setup() {
    const {
      records,
      type,
      comment,
      startDate,
      endDate,
      loginUserName,
      fetchButtonDisabled,
    } = toRefs(
      reactive<State>({
        records: [],
        type: "-1",
        comment: "",
        startDate: toDateString(prevWeekDay),
        endDate: toDateString(today),
        loginUserName: "None",
        fetchButtonDisabled: true,
      })
    );

    const addButtonDisabled = computed(() => {
      return (
        type.value === "-1" || (type.value === "0" && comment.value === "")
      );
    });

    onMounted(getRecordsList(records, prevWeekDay, today));
    onMounted(async () => {
      const userName = await getUserName();
      if (userName !== null) {
        loginUserName.value = userName;
      }
    });

    const dateChanged = () => {
      fetchButtonDisabled.value = false;
    };

    const reAcquire = async () => {
      records.value = [];
      await getRecordsList(
        records,
        new Date(startDate.value),
        new Date(endDate.value)
      )();
      fetchButtonDisabled.value = true;
    };

    const addRecord = async () => {
      const addedRecord = await addRecordToFirestore(
        +type.value,
        comment.value
      );
      if (addedRecord) {
        records.value.splice(0, 0, addedRecord);
        type.value = "-1";
        comment.value = "";
      }
    };
    const deleteRecord = async (id: string) => {
      if (confirm("削除しますか？")) {
        await deleteRecordFromFirestore(id);
        await reAcquire();
      }
    };

    return {
      records,
      recordTypeStr,
      type,
      comment,
      addRecord,
      deleteRecord,
      startDate,
      endDate,
      reAcquire,
      loginUserName,
      addButtonDisabled,
      fetchButtonDisabled,
      dateChanged,
    };
  },
});
</script>

<style lang="scss" scoped>
.login-name-display {
  width: 80%;
  margin: 16px auto;
}
.record-table {
  width: 90%;
  height: auto;
  margin: 30px auto;
  overflow-x: scroll;
  border-collapse: separate;
  border-spacing: 0px 30px;
}
.record-container__day-selector {
  display: flex;
  justify-content: center;
  > input {
    margin: auto 15px;
  }
}
.record-container {
  .input-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    > div {
      width: 50%;
      display: flex;
      justify-content: left;
    }
  }
}
</style>
