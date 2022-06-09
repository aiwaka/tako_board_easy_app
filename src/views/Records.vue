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

      <!-- 任意時刻入力ボックス -->
      <arbitrary-time-input-vue
        @input-time-changed="inputTimeChanged"
        @toggle-active="toggleArbitTimeActive"
      />

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
import ArbitraryTimeInputVue from "@/components/ArbitraryTimeInput.vue";

interface State {
  arbitraryTimeActive: boolean; // 任意時刻入力が有効かどうか
  comment: string;
  imageObj: File | null;
  records: Record[];
  recordTime: Date;
  type: string;
  uploadStatus: number;
}

export default defineComponent({
  components: {
    RecordRow,
    FileUploaderVue,
    DateSelectorVue,
    ArbitraryTimeInputVue,
  },
  setup() {
    const {
      arbitraryTimeActive,
      comment,
      imageObj,
      records,
      recordTime,
      type,
      uploadStatus,
    } = toRefs(
      reactive<State>({
        arbitraryTimeActive: false,
        comment: "",
        imageObj: null,
        records: [],
        recordTime: new Date(),
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
      arbitraryTimeActive.value = !arbitraryTimeActive.value;
    };

    // 開始終了日付を指定してその期間のレコードリストを取得する.
    const acquireList = async (startDate: string, endDate: string) => {
      records.value = [];
      await getRecordsList(records, new Date(startDate), new Date(endDate))();
    };

    const imageUploaded = (file: File) => {
      imageObj.value = file;
    };
    const imageDeleted = () => {
      imageObj.value = null;
    };

    const inputTimeChanged = (time: Date) => {
      // 任意入力時刻が変更された場合に現在時刻を設定する.
      recordTime.value = time;
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
        arbitraryTimeActive.value ? recordTime.value : null,
        imageName
      );
      if (addedRecord) {
        // 送信がなされたら今送ったものをリストに追加し, 各フォームをリセットする.
        records.value.splice(0, 0, addedRecord);
        // 任意時刻入力ボックスはあえて閉じない. 連続して入力できるようにする.
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
      arbitraryTimeActive,
      comment,
      deleteRecord,
      imageUploaded,
      imageDeleted,
      inputTimeChanged,
      onUploaderReset,
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
.record-table {
  width: 90%;
  height: auto;
  margin: 30px auto;
  overflow-x: scroll;
  border-collapse: separate;
  border-spacing: 0px 30px;
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
