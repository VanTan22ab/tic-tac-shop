import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import vi from "date-fns/locale/vi";
registerLocale("vi", vi);

export default function CostForm({ onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name || !quantity || !price || !date) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Bạn chưa đăng nhập.");

      await addDoc(collection(db, "costs"), {
        userId: user.uid,
        name,
        quantity: Number(quantity),
        price: Number(price),
        date: date.toISOString().split("T")[0],
        createdAt: serverTimestamp(),
      });

      setName("");
      setQuantity("");
      setPrice("");
      setDate(null);

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError("Lỗi khi lưu dữ liệu: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="absolute z-10 lg:top-20 lg:right-40 p-6 max-w-xl mx-auto bg-white rounded shadow mt-6 border">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Thêm chi phí nguyên liệu</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          className="w-full border border-gray-300 p-2 rounded"
          placeholder="Tên nguyên liệu"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          min="0"
          className="w-full border border-gray-300 p-2 rounded"
          placeholder="Số lượng"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <input
          type="number"
          min="0"
          className="w-full border border-gray-300 p-2 rounded"
          placeholder="Đơn giá"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <DatePicker
          selected={date}
          onChange={(date) => setDate(date)}
          dateFormat="dd/MM/yyyy"
          placeholderText="Chọn ngày (dd/mm/yyyy)"
          locale="vi"
          className="w-full border border-gray-300 p-2 rounded"
        />
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex space-x-3 mt-2">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
