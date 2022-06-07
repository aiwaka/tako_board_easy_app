import { storage } from "@/settings/firebase";
import { getDownloadURL, ref } from "firebase/storage";

export const getImageURL = async (filename: string): Promise<string> => {
  const fileRef = ref(storage, `documents/${filename}`);
  const url = await getDownloadURL(fileRef);
  return url;
};
