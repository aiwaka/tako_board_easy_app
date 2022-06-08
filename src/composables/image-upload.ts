import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Ref } from "vue";
import { storage } from "@/settings/firebase";
import { generateUuid4 } from "@/composables/uuid4";

export const uploadImageToFirebase = (
  imageFile: File,
  uploadProgress: Ref<number> | null = null
): string => {
  const randomFileName = generateUuid4() + "_" + imageFile.name;
  const imageRef = ref(storage, "images/" + randomFileName);

  const uploadTask = uploadBytesResumable(imageRef, imageFile);
  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const percentage =
        Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 10000) /
        100;
      if (uploadProgress !== null) {
        uploadProgress.value = percentage;
      }
    },
    (err) => {
      // エラー処理
      console.log(err);
      alert("ファイルのアップロードに失敗しました。");
    },
    () => {
      // 終了処理
      getDownloadURL(uploadTask.snapshot.ref).then(() => {
        // console.log("File available at", downloadURL);
      });
    }
  );
  return randomFileName;
};
