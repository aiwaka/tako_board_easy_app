<template>
  <div class="record-container">
    <date-selector-vue :fetch-callback="acquireList" />

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
            この欄を開いたまま「追加」することで任意の時刻を反映できます。<br />
            時刻は時の次に分をクリック・タップして入力します。
          </span>
          <br />
          <label>日付</label>
          <datepicker
            class="date-picker"
            startingView="day"
            minimumView="day"
            inputFormat="yyyy-MM-dd"
            v-model="pickedDate"
          />
          <label>時刻</label>
          <datepicker
            class="date-picker"
            startingView="time"
            minimumView="time"
            inputFormat="HH:mm"
            v-model="pickedTime"
          />
        </div>
      </div>

      <!-- 画像追加コンテナ -->
      <file-uploader-vue
        ref="uploaderRef"
        :uploadWatcher="uploadStatus"
        @uploaded="imageUploaded"
        @reset-finished="onUploaderReset"
      />

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
import { defineComponent, reactive, computed, toRefs } from "vue";
import { Record, recordTypeStr } from "@/modules/record";
import getRecordsList from "@/composables/get-records-list";
import addRecordToFirestore from "@/composables/add-record";
import deleteRecordFromFirestore from "@/composables/delete-record";
import { uploadImageToFirebase } from "@/composables/image-upload";
import RecordRow from "@/components/RecordRow.vue";
import DateSelectorVue from "@/components/DateSelector.vue";
import FileUploaderVue from "@/components/FileUploader.vue";
import { toDateString, toTimeString } from "@/composables/utils";
import Datepicker from "vue3-datepicker";

interface State {
  arbitTimeActive: boolean; // 任意時刻入力が有効かどうか
  comment: string;
  imageObj: File | null;
  inputDate: string; // 任意時刻入力のための日付文字列
  inputTime: string; // 上と同様の時刻文字列
  pickedDate: Date;
  pickedTime: Date;
  records: Record[];
  type: string;
  uploadStatus: number;
}

export default defineComponent({
  components: {
    RecordRow,
    FileUploaderVue,
    datepicker: Datepicker,
    DateSelectorVue,
  },
  setup() {
    const {
      arbitTimeActive,
      comment,
      imageObj,
      inputDate,
      inputTime,
      pickedDate,
      pickedTime,
      records,
      type,
      uploadStatus,
    } = toRefs(
      reactive<State>({
        arbitTimeActive: false,
        comment: "",
        imageObj: null,
        inputDate: toDateString(new Date()),
        inputTime: toTimeString(new Date()),
        pickedDate: new Date(),
        pickedTime: new Date(),
        records: [],
        type: "-1",
        uploadStatus: 0,
      })
    );

    const addButtonDisabled = computed(() => {
      return (
        type.value === "-1" || (type.value === "0" && comment.value === "")
      );
    });

    const toggleArbitTimeActive = () => {
      arbitTimeActive.value = !arbitTimeActive.value;
    };

    // 開始終了日付を指定してその期間のレコードリストを取得する.
    const acquireList = async (startDate: string, endDate: string) => {
      records.value = [];
      await getRecordsList(records, new Date(startDate), new Date(endDate))();
    };

    const getArbitTimeAsDate = () => {
      // 外部パッケージを用いて取得した日時を一つのDateオブジェクトにして返す.
      const date = pickedDate.value;
      const time = pickedTime.value;
      return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes()
      );
    };

    const imageUploaded = (file: File) => {
      imageObj.value = file;
    };
    const imageDeleted = () => {
      imageObj.value = null;
    };

    const addRecord = async () => {
      // 画像がある場合は追加
      uploadStatus.value = 1;
      let imageName = "";
      if (imageObj.value !== null) {
        imageName = uploadImageToFirebase(imageObj.value);
      }
      const addedRecord = await addRecordToFirestore(
        +type.value, // +演算子で数値的な文字列を数値に変換する.
        comment.value,
        arbitTimeActive.value ? getArbitTimeAsDate() : null,
        imageName
      );
      if (addedRecord) {
        records.value.splice(0, 0, addedRecord);
        type.value = "-1";
        comment.value = "";
        imageObj.value = null;
        uploadStatus.value = 2;
      }
    };

    const onUploaderReset = () => {
      uploadStatus.value = 0;
    };

    const deleteRecord = async (id: string) => {
      if (confirm("削除しますか？")) {
        await deleteRecordFromFirestore(id);
        const index = records.value.findIndex((rec) => rec.id === id);
        if (index !== -1) {
          records.value.splice(index, 1);
        }
      }
    };

    return {
      acquireList,
      addButtonDisabled,
      addRecord,
      arbitTimeActive,
      comment,
      deleteRecord,
      imageUploaded,
      imageDeleted,
      inputDate,
      inputTime,
      onUploaderReset,
      pickedDate,
      pickedTime,
      records,
      recordTypeStr,
      toggleArbitTimeActive,
      type,
      uploadStatus,
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
  .date-picker input {
    width: 7rem;
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
