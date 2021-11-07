import { collection, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db, getCurrentUser } from "@/settings/firebase";
import { Record } from "@/modules/record";

export default async (
  type: number,
  comment: string
): Promise<Record | null> => {
  console.log("add record");
  const user = await getCurrentUser();
  const uid = user?.uid;
  console.log(uid);
  if (uid) {
    const recordsRef = doc(db, "users", uid);
    const userSnap = await getDoc(recordsRef);
    if (!userSnap.exists()) return null;
    const userName = userSnap.data().name;
    const newRecordRef = doc(collection(recordsRef, "records"));
    const currentDate = Timestamp.now();
    const newRecordData = {
      type,
      comment,
      date: currentDate,
    };
    await setDoc(newRecordRef, newRecordData);
    const newRec = new Record(
      newRecordRef.id,
      userName,
      type,
      currentDate,
      comment
    );
    return newRec;
  }

  return null;
};
