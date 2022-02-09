<template>
  <div class="record-container">
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

      <!-- 任意時刻を指定できるボックス. 反映されるか否かはボックスを開いているか否かのみに依存する. -->
      <div class="arbitrary-time-input">
        <div v-if="!arbitTimeActive">
          <div class="arbit-time-input__button" @click="toggleArbitTimeActive">
            +
          </div>
          <span>任意時刻を入力する場合は+ボタンを押して開く</span>
        </div>
        <div v-else>
          <div class="arbit-time-input__button" @click="toggleArbitTimeActive">
            -
          </div>
          <span>
            このボックスを開いたまま「追加」することで任意の時刻を反映できます。
          </span>
          <br />
          <input type="date" v-model="inputDate" />
          <input type="time" v-model="inputTime" />
        </div>
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
import RecordRow from "@/components/RecordRow.vue";

const today = new Date();
const tempToday = new Date();
const prevWeekDay = new Date(tempToday.setDate(tempToday.getDate() - 7));

const fillZero = (num: number, digit: number): string => {
  // digit桁になるように0埋めした文字列を返す. num, digitは整数の前提.
  return ("0".repeat(digit - 1) + num).slice(-digit);
};

const toDateString = (date: Date): string => {
  // input[type='date']で用いる日付文字列に変換する
  return (
    `${date.getFullYear()}-${fillZero(date.getMonth() + 1, 2)}` +
    `-${fillZero(date.getDate(), 2)}`
  );
};

const toTimeString = (time: Date): string => {
  // input[type='time']で用いる時刻文字列に変換する. 秒は用いない.
  return (
    `${fillZero(time.getHours(), 2)}` + `:${fillZero(time.getMinutes(), 2)}`
  );
};

interface State {
  records: Record[];
  type: string;
  comment: string;
  startDate: string;
  endDate: string;
  fetchButtonDisabled: boolean;
  inputDate: string; // 任意時刻入力のための日付文字列
  inputTime: string; // 上と同様の時刻文字列
  arbitTimeActive: boolean; // 任意時刻入力が有効かどうか
}

export default defineComponent({
  components: { RecordRow },
  setup() {
    const {
      records,
      type,
      comment,
      startDate,
      endDate,
      fetchButtonDisabled,
      inputDate,
      inputTime,
      arbitTimeActive,
    } = toRefs(
      reactive<State>({
        records: [],
        type: "-1",
        comment: "",
        startDate: toDateString(prevWeekDay),
        endDate: toDateString(today),
        fetchButtonDisabled: true,
        inputDate: toDateString(today),
        inputTime: toTimeString(today),
        arbitTimeActive: false,
      })
    );

    const addButtonDisabled = computed(() => {
      return (
        type.value === "-1" || (type.value === "0" && comment.value === "")
      );
    });

    onMounted(getRecordsList(records, prevWeekDay, today));

    const dateChanged = () => {
      fetchButtonDisabled.value = false;
    };

    const toggleArbitTimeActive = () => {
      arbitTimeActive.value = !arbitTimeActive.value;
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

    const getArbitTimeAsDate = () => {
      // 文字列からDateオブジェクトを生成（推奨されていないようなのでいい方法があれば変更する）
      return new Date(
        inputDate.value.toString() + " " + inputTime.value.toString()
      );
    };

    const addRecord = async () => {
      const addedRecord = await addRecordToFirestore(
        +type.value,
        comment.value,
        arbitTimeActive.value ? getArbitTimeAsDate() : null
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
      inputDate,
      inputTime,
      arbitTimeActive,
      toggleArbitTimeActive,
      reAcquire,
      addButtonDisabled,
      fetchButtonDisabled,
      dateChanged,
    };
  },
});
</script>

<style lang="scss" scoped>
.arbitrary-time-input {
  border: 1px dashed #777777;
  padding: 1rem 0.6rem;
  .arbit-time-input__button {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    line-height: 1rem;
    border: 1px solid #000000;
    cursor: pointer;
  }
  span {
    margin: 0 0.5rem;
  }
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
