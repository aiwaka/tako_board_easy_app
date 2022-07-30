<template>
  <div class="record-container">
    <query-maker :fetch-callback="acquireList" />
    <div class="input-box">
      <div>
        <label>
          タイプ
          <select name="record-type" v-model="recordType">
            <option value="-1">---</option>
            <option
              v-for="(recordType, index) in recordTypeStr"
              :key="recordType"
              :value="'' + index"
            >
              <!-- valueをバインドする際は-1に合わせるためstringに変換している. -->
              {{ recordType }}
            </option>
          </select>
        </label>
      </div>
      <div>
        <label>
          コメント
          <input
            recordType="text"
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

    <!-- レコードリスト -->
    <record-list-vue :records="records" @delete-record="deleteRecord" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, toRefs } from "vue";
import { Record, recordTypeStr } from "@/modules/record";
import { getRecordsList } from "@/composables/get-records-list";
import { addRecordToFirestore } from "@/composables/add-record";
import { uploadImageToFirebase } from "@/composables/image-upload";
import ArbitraryTimeInputVue from "@/components/ArbitraryTimeInput.vue";
import FileUploaderVue from "@/components/FileUploader.vue";
import RecordListVue from "@/components/RecordList.vue";
import QueryMaker from "@/components/QueryMaker.vue";
import { QueryConstraint } from "@firebase/firestore";

interface State {
  arbitraryTimeActive: boolean; // 任意時刻入力が有効かどうか
  comment: string;
  imageObj: File | null;
  records: Record[];
  recordTime: Date;
  recordType: string;
  uploadStatus: number;
}

export default defineComponent({
  components: {
    ArbitraryTimeInputVue,
    FileUploaderVue,
    RecordListVue,
    QueryMaker,
  },
  setup() {
    const {
      arbitraryTimeActive,
      comment,
      imageObj,
      records,
      recordTime,
      recordType,
      uploadStatus,
    } = toRefs(
      reactive<State>({
        arbitraryTimeActive: false,
        comment: "",
        imageObj: null,
        records: [],
        recordTime: new Date(),
        recordType: "-1",
        uploadStatus: 0,
      })
    );

    const addButtonDisabled = computed(
      () =>
        recordType.value === "-1" ||
        (recordType.value === "0" && comment.value === "")
    );

    // レコードリストを取得. クエリメーカーで作成されたクエリを渡してもらう.
    const acquireList = async (queries: QueryConstraint[]) => {
      records.value = [];
      await getRecordsList(records, queries)();
    };

    const imageUploaded = (file: File) => {
      imageObj.value = file;
    };
    const imageDeleted = () => {
      imageObj.value = null;
    };
    const onUploaderReset = () => {
      uploadStatus.value = 0;
    };

    const toggleArbitTimeActive = () => {
      arbitraryTimeActive.value = !arbitraryTimeActive.value;
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
        +recordType.value, // +演算子で数値的な文字列を数値に変換する.
        comment.value,
        arbitraryTimeActive.value ? recordTime.value : null,
        imageName
      );
      if (addedRecord) {
        // 送信がなされたら今送ったものをリストに追加し, 各フォームをリセットする.
        records.value.splice(0, 0, addedRecord);
        // 任意時刻入力ボックスはあえて閉じない. 連続して入力できるようにする.
        recordType.value = "-1";
        comment.value = "";
        imageObj.value = null;
        uploadStatus.value = 2;
      }
    };

    const deleteRecord = async (index: number) => {
      records.value.splice(index, 1);
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
      recordType,
      uploadStatus,
    };
  },
});
</script>

<style lang="scss" scoped>
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
