import { db } from "./firebase/config";
import { collection, addDoc } from "firebase/firestore";

export async function addTestCost() {
  try {
    const docRef = await addDoc(collection(db, "costs"), {
      name: "Xúc xích",
      quantity: 20,
      unitPrice: 5000,
      date: new Date().toISOString(),
    });
    console.log("Thêm thành công với ID:", docRef.id);
  } catch (e) {
    console.error("Lỗi khi ghi dữ liệu:", e);
  }
}
