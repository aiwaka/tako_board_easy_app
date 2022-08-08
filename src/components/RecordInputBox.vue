<template>
  <div class="record-input-container">
    <div class="record-input-form">
      <fieldset class="record-input">
        <label for="record-input--type">タイプ</label>
        <select id="record-input--type" name="record-type" v-model="recordType">
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

        <label for="record-input--text">コメント</label>
        <input
          type="text"
          id="record-input--text"
          name="comment"
          placeholder="comment"
          v-model="comment"
        />
      </fieldset>
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
    </div>
    <div
      class="arrow-icon"
      :class="{ 'active-arrow': !addButtonDisabled }"
    ></div>
    <div class="add-button-container">
      <button
        class="add-button"
        @click.prevent="addRecord"
        :disabled="addButtonDisabled"
      >
        追加
      </button>
    </div>
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
@use "sass:math";

.record-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.record-input-form {
  padding: 0.5rem 0.2rem;
  width: 100%;
  border: 1px solid #777;
  display: flex;
  flex-direction: column;
  align-items: center;
  > div {
    display: flex;
    justify-content: left;
  }
}

$inactive-arrow-color: gray;
$active-arrow-color: #42b983;
.arrow-icon {
  margin: 0.2rem;
  position: relative;
  padding-top: 32px;
  width: 32px;

  &::before {
    box-sizing: border-box;
    content: "";
    position: absolute;
    margin: auto;
    top: 16px;
    left: 0px;
    width: 16px;
    height: 16px;
    border: {
      top: 16px solid $inactive-arrow-color;
      bottom: 0px;
      left: 16px solid transparent;
      right: 16px solid transparent;
    }
  }
  &.active-arrow::before {
    border-top: 16px solid $active-arrow-color;
  }
  &::after {
    content: "";
    position: absolute;
    margin: auto;
    top: 3px;
    left: 16px - math.div(14px, 2);
    width: 14px;
    height: 13px;
    background-color: $inactive-arrow-color;
  }
  &.active-arrow::after {
    background-color: $active-arrow-color;
  }
}

.add-button-container {
  margin: 0.5rem auto;
}

fieldset.record-input {
  $item-height: 1.4rem;

  display: grid;
  grid-template-rows: repeat(2, $item-height);
  grid-template-columns: 4rem 1fr;
  row-gap: 1rem;
  column-gap: 0.7rem;
  padding: 0.6rem 1rem;
  border: none;

  input {
    color: inherit;
    border: 1px solid #777;
    transition: ease-in-out 0.2s;

    &:focus {
      outline-width: 0;
      border-radius: 5px;
      background-color: rgba(0, 0, 0, 0.1);
    }
  }

  select {
    border: 1px solid #777;
    transition: ease-in-out 0.2s;

    &:focus {
      outline-width: 0;
      border-radius: 5px;
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
