import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import RevenueForm from "./RevenueForm";

import DatePicker, { registerLocale } from "react-datepicker";
import vi from "date-fns/locale/vi";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("vi", vi);

export default function RevenueManagement() {
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editRevenue, setEditRevenue] = useState(null);
  const [formData, setFormData] = useState({
    itemName: "",
    quantity: 0,
    price: 0,
  });
  // riêng trạng thái ngày dùng DatePicker
  const [date, setDate] = useState(null);

  const [userId, setUserId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Lọc theo tháng (1 input month)
  const [filterMonth, setFilterMonth] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setRevenues([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchRevenues();
    }
  }, [userId]);

  async function fetchRevenues() {
    setLoading(true);
    try {
      const revenuesRef = collection(db, "revenues");
      const q = query(revenuesRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);
      let fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sắp xếp theo createdAt mới nhất lên trên đầu
      fetched.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setRevenues(fetched);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
    }
    setLoading(false);
    setCurrentPage(1); // reset trang khi tải lại
  }

  // Hàm lọc theo tháng (nếu filterMonth có giá trị thì so sánh "YYYY-MM" với tháng của revenue.date)
  const filteredRevenues = revenues.filter((rev) => {
    if (!filterMonth) return true; // không lọc
    if (!rev.date) return false; // dữ liệu không có date thì ẩn
    const revMonth = new Date(rev.date).toISOString().slice(0, 7); // lấy dạng YYYY-MM
    return revMonth === filterMonth;
  });

  // Tính phân trang
  const totalPages = Math.ceil(filteredRevenues.length / itemsPerPage);
  const displayedRevenues = filteredRevenues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  function startEdit(revenue) {
    setEditRevenue(revenue);
    setFormData({
      itemName: revenue.itemName || "",
      quantity: revenue.quantity || 0,
      price: revenue.price || 0,
    });
    setDate(revenue.date ? new Date(revenue.date) : null);
  }

  function cancelEdit() {
    setEditRevenue(null);
    setFormData({ itemName: "", quantity: 0, price: 0 });
    setDate(null);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function saveEdit() {
    if (!editRevenue) return;
    if (!date) {
      alert("Vui lòng chọn ngày nhập");
      return;
    }
    const revenueDoc = doc(db, "revenues", editRevenue.id);
    await updateDoc(revenueDoc, {
      itemName: formData.itemName,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      date: date.toISOString(), // lưu dạng ISO string
    });
    await fetchRevenues();
    cancelEdit();
  }

  async function deleteRevenue(id) {
    if (window.confirm("Bạn chắc chắn muốn xóa doanh thu này?")) {
      await deleteDoc(doc(db, "revenues", id));
      await fetchRevenues();
    }
  }

  const formatDate = (dateStr) => {
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj)) return "Không rõ";
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="p-2 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800">
          📊 Quản lý doanh thu
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
        >
          + Thêm doanh thu
        </button>
      </div>

      {/* Lọc tháng */}
      <div className="mb-4 flex items-center gap-3">
        <label className="font-semibold text-gray-700">
          Chọn tháng:
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => {
              setFilterMonth(e.target.value);
              setCurrentPage(1); // reset trang khi thay đổi bộ lọc
            }}
            className="ml-2 border rounded p-1"
          />
        </label>
        {filterMonth && (
          <button
            onClick={() => setFilterMonth("")}
            className="text-sm text-blue-600 hover:underline"
            title="Xóa bộ lọc"
          >
            ✖️ Xóa lọc
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <RevenueForm
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              fetchRevenues();
              setShowForm(false);
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="text-gray-600 italic">Đang tải dữ liệu...</div>
      ) : filteredRevenues.length === 0 ? (
        <p className="text-gray-500 text-center">
          Chưa có dữ liệu doanh thu nào.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-gray-200 shadow-sm rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 text-center">
                <tr>
                  <th className="p-3 border-b">#</th>
                  <th className="p-3 border-b">🛒 Tên món</th>
                  <th className="p-3 border-b">📦 Số lượng</th>
                  <th className="p-3 border-b">💵 Giá bán</th>
                  <th className="p-3 border-b">📅 Ngày nhập</th>
                  <th className="p-3 border-b">⏰ Ngày tạo</th>
                  <th className="p-3 border-b">⚙️ Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {displayedRevenues.map((revenue, index) => (
                  <tr
                    key={revenue.id}
                    className="hover:bg-gray-50 text-center transition"
                  >
                    <td className="p-3 border-b">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="p-3 border-b">{revenue.itemName}</td>
                    <td className="p-3 border-b">{revenue.quantity}</td>
                    <td className="p-3 border-b text-green-600 font-medium">
                      {revenue.price.toLocaleString()} ₫
                    </td>
                    <td className="p-3 border-b">{formatDate(revenue.date)}</td>
                    <td className="p-3 border-b">
                      {formatDate(revenue.createdAt)}
                    </td>
                    <td className="p-3 border-b space-x-4">
                      <button
                        onClick={() => startEdit(revenue)}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => deleteRevenue(revenue.id)}
                        className="text-red-600 hover:underline font-semibold"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 w-full flex justify-between items-center">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-4 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              {"Trang Trước"}
            </button>
            Trang {currentPage} / {totalPages}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              {"Trang Sau"}
            </button>
          </div>

          {editRevenue && (
            <div className="absolute top-20 lg:w-[50%] right-6 lg:right-70 mt-6 p-4 border rounded shadow bg-gray-50 max-w-md mx-auto">
              <h3 className="mb-3 text-xl font-bold text-gray-700">
                ✍️ Sửa doanh thu
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveEdit();
                }}
              >
                <label className="block mb-2 font-semibold text-gray-600">
                  Ngày nhập
                  <DatePicker
                    selected={date}
                    onChange={(selectedDate) => setDate(selectedDate)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn ngày (dd/mm/yyyy)"
                    locale="vi"
                    className="w-full mt-1 rounded border-gray-300 shadow-sm p-2"
                    maxDate={new Date()}
                    required
                  />
                </label>
                <label className="block mb-2 font-semibold text-gray-600">
                  Tên món
                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                    required
                  />
                </label>
                <label className="block mb-2 font-semibold text-gray-600">
                  Số lượng
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min={0}
                    className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                    required
                  />
                </label>
                <label className="block mb-2 font-semibold text-gray-600">
                  Giá bán
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min={0}
                    className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                    required
                  />
                </label>
                <div className="flex justify-end gap-4 mt-4">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
