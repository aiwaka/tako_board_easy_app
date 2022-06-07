<template>
  <div class="image-uploader-container">
    <label for="image-uploader">添付画像を1枚選択</label>
    <input
      name="image-uploader"
      class="image-uploader"
      type="file"
      accept="image/*"
      @change="onImageUpload"
    />
    <div v-if="uploadStatus == 2">
      <img class="image-preview" :src="uploadedImage" alt="" />
    </div>
    <div class="progress-container" v-if="uploadStatus == 1">
      <div class="progress-bar-container">
        <div
          class="progress-bar"
          :style="{ width: String(uploadProgress) + '%' }"
        ></div>
      </div>
      <p>{{ uploadProgress }}%</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from "vue";
import { uploadImage } from "@/composables/image-upload";

interface State {
  fileLinkURL: string;
  uploadedImage: string;
  uploadProgress: number;
  uploadStatus: number; // 0: 上げていない, 1: 動作中, 2: 終了
}

export default defineComponent({
  setup() {
    const { fileLinkURL, uploadedImage, uploadProgress, uploadStatus } = toRefs(
      reactive<State>({
        fileLinkURL: "",
        uploadedImage: "",
        uploadProgress: 0,
        uploadStatus: 0,
      })
    );

    // アップロードした画像を表示
    const createImage = (file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          uploadedImage.value = String(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    };

    // eslint-disable-next-line
    const onImageUpload = (payload: any) => {
      // アップロード動作をしたとき
      uploadStatus.value = 1;
      uploadImage(payload, uploadProgress, uploadStatus, fileLinkURL);
      createImage(payload.srcElement.files[0]);
    };
    return {
      fileLinkURL,
      onImageUpload,
      uploadedImage,
      uploadStatus,
      uploadProgress,
    };
  },
});
</script>

<style lang="scss" scoped>
.image-preview {
  border: 2px solid #777777;
  width: 13rem;
}
.progress-container {
  width: 25%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.progress-bar-container {
  width: 70%;
}
.progress-bar {
  width: 100%;
  height: 0.3rem;
  background-color: #42b983;
  transition: 0.1s;
}
</style>
