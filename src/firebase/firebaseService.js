import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "./config";

// Lấy chi phí của user hiện tại
export async function getCosts(userId) {
  const costsCol = collection(db, "costs");
  // Tạo query lọc theo userId
  const q = query(costsCol, where("userId", "==", userId));
  const costsSnapshot = await getDocs(q);
  return costsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Lấy doanh thu của user hiện tại
export async function getRevenues(userId) {
  const revenuesCol = collection(db, "revenues");
  // Tạo query lọc theo userId
  const q = query(revenuesCol, where("userId", "==", userId));
  const revenuesSnapshot = await getDocs(q);
  return revenuesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Thêm chi phí kèm userId
export async function addCost(data, userId) {
  await addDoc(collection(db, "costs"), { ...data, userId });
}

// Thêm doanh thu kèm userId
export async function addRevenue(data, userId) {
  await addDoc(collection(db, "revenues"), { ...data, userId });
}
