<template>
  <div class="image-uploader-container">
    <div>
      <label for="image-uploader">添付画像を1枚選択</label>
      <input
        name="image-uploader"
        class="image-uploader"
        type="file"
        accept="image/*"
        @change="onImageUpload"
      />
    </div>
    <div v-if="uploadedImageURL !== ''">
      <img class="image-preview" :src="uploadedImageURL" alt="" />
    </div>
    <!-- <div class="progress-container" v-if="uploadStatus == 1">
      <div class="progress-bar-container">
        <div
          class="progress-bar"
          :style="{ width: String(uploadProgress) + '%' }"
        ></div>
      </div>
      <p>{{ uploadProgress }}%</p>
    </div> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, watch } from "vue";

interface State {
  uploadedImageURL: string;
}

export default defineComponent({
  emits: ["uploaded", "reset-finished"],
  props: {
    // 外部の状態変化を監視するためのprop
    uploadWatcher: {
      type: Number,
      required: true,
    },
    // uploadProgress: {
    //   type: Number,
    //   required: true,
    // },
  },
  setup(props, context) {
    const { uploadedImageURL } = toRefs(
      reactive<State>({
        uploadedImageURL: "",
      })
    );
    const { uploadWatcher } = toRefs(props);

    watch(uploadWatcher, (status, prevStatus) => {
      // statusが実行中から終了に変化したら画像を消去する.
      if (prevStatus === 1 && status == 2) {
        reset();
      }
    });

    const reset = () => {
      uploadedImageURL.value = "";
      context.emit("reset-finished");
    };

    // アップロードした画像を表示
    const createImagePreview = (file: File) => {
      if (file === undefined) {
        reset();
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          uploadedImageURL.value = String(event.target.result);
        }
      };
      reader.onabort = () => {
        reader.abort();
        reset();
      };
      if (file) {
        reader.readAsDataURL(file);
      }
    };

    // eslint-disable-next-line
    const onImageUpload = (payload: any) => {
      // アップロード動作をしたとき
      const uploadedFile: File = payload.srcElement.files[0];
      createImagePreview(uploadedFile);
      context.emit("uploaded", uploadedFile);
    };
    return {
      onImageUpload,
      uploadedImageURL,
    };
  },
});
</script>

<style lang="scss" scoped>
.image-uploader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
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
