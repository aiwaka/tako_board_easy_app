import { collection, addDoc } from "firebase/firestore";
import { db, getCurrentUser } from "@/settings/firebase";

export default async (type: number, comment: string): Promise<void> => {
  console.log("add record");
  const user = await getCurrentUser();
  const uid = user?.uid;
  console.log(uid);
  if (uid) {
    await addDoc(collection(db, "users", "test", "records"), {
      type,
      comment,
      date: new Date(),
    });
  }
};
