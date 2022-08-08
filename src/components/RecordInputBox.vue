<template>
  <div class="record-input-box">
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
</template>

<script lang="ts">
import { defineComponent, reactive, computed, toRefs } from "vue";
import { recordTypeStr } from "@/modules/record";
import { addRecordToFirestore } from "@/composables/add-record";
import { uploadImageToFirebase } from "@/composables/image-upload";
import ArbitraryTimeInputVue from "@/components/ArbitraryTimeInput.vue";
import FileUploaderVue from "@/components/FileUploader.vue";

interface State {
  arbitraryTimeActive: boolean; // 任意時刻入力が有効かどうか
  comment: string;
  imageObj: File | null;
  recordTime: Date;
  recordType: string;
  uploadStatus: number;
}

export default defineComponent({
  components: {
    ArbitraryTimeInputVue,
    FileUploaderVue,
  },
  emits: ["record-added"],
  setup(_, context) {
    const {
      arbitraryTimeActive,
      comment,
      imageObj,
      recordTime,
      recordType,
      uploadStatus,
    } = toRefs(
      reactive<State>({
        arbitraryTimeActive: false,
        comment: "",
        imageObj: null,
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
        context.emit("record-added", addedRecord);
        // 任意時刻入力ボックスはあえて閉じない. 連続して入力できるようにする.
        recordType.value = "-1";
        comment.value = "";
        imageObj.value = null;
        uploadStatus.value = 2;
      }
    };

    return {
      addButtonDisabled,
      addRecord,
      arbitraryTimeActive,
      comment,
      imageUploaded,
      imageDeleted,
      inputTimeChanged,
      onUploaderReset,
      recordTypeStr,
      toggleArbitTimeActive,
      recordType,
      uploadStatus,
    };
  },
});
</script>

<style lang="scss" scoped>
.record-input-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  > div {
    // width: 50%;
    display: flex;
    justify-content: left;
  }
}
</style>
