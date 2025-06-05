import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import vi from "date-fns/locale/vi";
registerLocale("vi", vi);

function RevenueForm({ onClose, onSuccess }) {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!itemName || !quantity || !price || !date) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (quantity <= 0 || price <= 0) {
      setError("Số lượng và giá phải lớn hơn 0.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("Bạn cần đăng nhập để nhập doanh thu.");
        return;
      }

      await addDoc(collection(db, "revenues"), {
        userId: user.uid,
        itemName,
        quantity: Number(quantity),
        price: Number(price),
        date: date.toISOString().split("T")[0], // Lưu dạng yyyy-mm-dd
        createdAt: serverTimestamp(),
      });

      setSuccess("Lưu doanh thu thành công!");
      setItemName("");
      setQuantity("");
      setPrice("");
      setDate(null);

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError("Lỗi khi lưu doanh thu: " + err.message);
    }
  };

  return (
    <div className="absolute z-10 lg:top-20 lg:right-20 p-6 mt-6 bg-white rounded shadow-md border">
      <h2 className="text-2xl font-bold mb-4 text-green-700">Thêm doanh thu</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          className="w-full border p-2 rounded"
          placeholder="Tên món bán"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          type="number"
          placeholder="Giá bán mỗi món"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="1"
        />
        <DatePicker
          selected={date}
          onChange={(date) => setDate(date)}
          dateFormat="dd/MM/yyyy"
          placeholderText="Chọn ngày (dd/mm/yyyy)"
          locale="vi"
          className="w-full border p-2 rounded"
        />
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Lưu
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

export default RevenueForm;
