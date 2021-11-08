import { doc, deleteDoc } from "firebase/firestore";
import { db, getCurrentUser } from "@/settings/firebase";

export default async (recordId: string): Promise<void | null> => {
  const user = await getCurrentUser();
  const uid = user?.uid;
  if (!uid) return null;
  await deleteDoc(doc(db, "users", uid, "records", recordId));
};
