import { doc, getDoc } from "@firebase/firestore";
import { db, getCurrentUser } from "@/settings/firebase";

export default async (): Promise<string | null> => {
  const user = await getCurrentUser();
  const uid = user?.uid;
  console.log(uid);
  if (!uid) {
    return null;
  }
  const recordsRef = doc(db, "users", uid);
  const userSnap = await getDoc(recordsRef);
  if (!userSnap.exists()) return null;
  return userSnap.data().name as string;
};
