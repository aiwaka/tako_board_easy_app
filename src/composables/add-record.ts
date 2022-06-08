import { collection, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db, getCurrentUser } from "@/settings/firebase";
import { Record } from "@/modules/record";

export default async (
  type: number,
  comment: string,
  inputTime: Date | null = null,
  imageName = ""
): Promise<Record | null> => {
  if (type === -1) {
    alert("レコードタイプを選んでください.");
    return null;
  } else if (type === 0 && comment === "") {
    alert("コメントのみを送る場合はコメントが必須です。");
  }
  // console.log("add record");
  const user = await getCurrentUser();
  const uid = user?.uid;
  // console.log(uid);
  if (!uid) {
    return null;
  }
  const recordsRef = doc(db, "users", uid);
  const userSnap = await getDoc(recordsRef);
  if (!userSnap.exists()) return null;
  const userName = userSnap.data().name;
  const newRecordRef = doc(collection(recordsRef, "records"));
  // 時刻が指定されているならそれを用い, そうでなければ現在時刻を取得して用いる.
  const currentDate = inputTime
    ? Timestamp.fromDate(inputTime)
    : Timestamp.now();

  const newRecordData = {
    type,
    userId: uid,
    comment,
    name: userName,
    date: currentDate,
    imageName,
  };
  // newRecordRefに今追加したレコードのオブジェクトをセットしてリロードなしで使えるようにする.
  await setDoc(newRecordRef, newRecordData);
  const newRec = new Record(
    newRecordRef.id,
    uid,
    userName,
    type,
    currentDate,
    comment,
    imageName
  );
  return newRec;
};
