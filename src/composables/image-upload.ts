import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Ref } from "vue";
import { storage } from "@/settings/firebase";
import { generateUuid4 } from "@/composables/uuid4";

export const uploadImage = async (
  // eslint-disable-next-line
  payload: any,
  uploadProgress: Ref<number>,
  uploadStatus: Ref<number>,
  fileLinkRef: Ref<string>
): Promise<void> => {
  console.log(payload.srcElement.files[0]);
  const file: File = payload.srcElement.files[0];
  const randomFileName = generateUuid4() + "_" + file.name;
  const imageRef = ref(storage, "images/" + randomFileName);

  const uploadTask = uploadBytesResumable(imageRef, file);
  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const percentage =
        Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 10000) /
        100;
      uploadProgress.value = percentage;
    },
    (err) => {
      // エラー処理
      console.log(err);
      alert("ファイルのアップロードに失敗しました。");
    },
    () => {
      // 終了処理
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        console.log("File available at", downloadURL);
        uploadStatus.value = 2;
        fileLinkRef.value = downloadURL;
      });
    }
  );
};
