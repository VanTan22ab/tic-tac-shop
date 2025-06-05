import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import CostForm from "./CostForm";

import DatePicker, { registerLocale } from "react-datepicker";
import vi from "date-fns/locale/vi";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("vi", vi);

// Hàm định dạng ngày theo dd/mm/yyyy
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function CostManagement() {
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCost, setEditCost] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: 0,
    price: 0,
    date: null, // sửa thành null vì sẽ dùng Date object
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterMonth, setFilterMonth] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchCosts();
  }, []);

  async function fetchCosts() {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      setCosts([]);
      setLoading(false);
      return;
    }
    const costsCol = collection(db, "costs");
    const q = query(costsCol, where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => {
      const item = doc.data();
      return {
        id: doc.id,
        ...item,
        createdAt: item.createdAt?.toDate?.() || null,
      };
    });

    data.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return b.createdAt - a.createdAt;
    });

    setCosts(data);
    setLoading(false);
  }

  function startEdit(cost) {
    setEditCost(cost);
    setFormData({
      name: cost.name,
      quantity: cost.quantity,
      price: cost.price,
      date: cost.date ? new Date(cost.date) : null,
    });
  }

  function cancelEdit() {
    setEditCost(null);
    setFormData({ name: "", quantity: 0, price: 0, date: null });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function saveEdit() {
    if (!editCost) return;
    const costDoc = doc(db, "costs", editCost.id);
    await updateDoc(costDoc, {
      name: formData.name,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      date: formData.date ? formData.date.toISOString() : "",
    });
    await fetchCosts();
    cancelEdit();
  }

  async function deleteCost(id) {
    if (window.confirm("Bạn chắc chắn muốn xóa?")) {
      await deleteDoc(doc(db, "costs", id));
      await fetchCosts();
    }
  }

  const filteredCosts = filterMonth
    ? costs.filter((cost) => cost.date?.startsWith(filterMonth))
    : costs;

  const totalPages = Math.ceil(filteredCosts.length / ITEMS_PER_PAGE);

  const pagedCosts = filteredCosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function handleFilterChange(e) {
    setFilterMonth(e.target.value);
    setCurrentPage(1);
  }

  function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <div className="p-2 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800">
          🧾 Quản lý chi phí nguyên liệu
        </h2>
        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
        >
          {showAddForm ? "Đóng form" : "+ Thêm chi phí"}
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="filterMonth" className="mr-2 font-semibold">
          Lọc theo tháng:
        </label>
        <input
          id="filterMonth"
          type="month"
          value={filterMonth}
          onChange={handleFilterChange}
          className="border p-1 rounded"
        />
        {filterMonth && (
          <button
            onClick={() => {
              setFilterMonth("");
              setCurrentPage(1);
            }}
            className="ml-2 text-red-600 hover:underline"
          >
            Bỏ lọc
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="mb-6">
          <CostForm onClose={() => setShowAddForm(false)} onSuccess={fetchCosts} />
        </div>
      )}

      {loading ? (
        <div className="text-gray-600 italic">Đang tải dữ liệu...</div>
      ) : filteredCosts.length === 0 ? (
        <p className="text-gray-500 text-center">
          Không có dữ liệu chi phí nguyên liệu phù hợp.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-gray-200 shadow-sm rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700">
                <tr className="text-center">
                  <th className="p-3 border-b">#</th>
                  <th className="p-3 border-b">🥬 Tên nguyên liệu</th>
                  <th className="p-3 border-b">📦 Số lượng</th>
                  <th className="p-3 border-b">💰 Đơn giá</th>
                  <th className="p-3 border-b">📅 Ngày nhập</th>
                  <th className="p-3 border-b">🕒 Ngày tạo</th>
                  <th className="p-3 border-b">⚙️ Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedCosts.map((cost, index) => (
                  <tr
                    key={cost.id}
                    className="hover:bg-gray-50 text-center transition"
                  >
                    <td className="p-3 border-b font-bold">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="p-3 border-b">{cost.name}</td>
                    <td className="p-3 border-b">{cost.quantity}</td>
                    <td className="p-3 border-b text-red-600 font-medium">
                      {cost.price.toLocaleString()} ₫
                    </td>
                    <td className="p-3 border-b">
                      {cost.date ? formatDate(cost.date) : "-"}
                    </td>
                    <td className="p-3 border-b text-sm text-gray-500">
                      {cost.createdAt
                        ? `${formatDate(cost.createdAt)} ${cost.createdAt.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}`
                        : "-"}
                    </td>
                    <td className="p-3 border-b space-x-4">
                      <button
                        onClick={() => startEdit(cost)}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => deleteCost(cost.id)}
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

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              Trang trước
            </button>
            <span>
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        </>
      )}

      {editCost && (
        <div className="absolute top-20 lg:w-[50%] right-8 lg:right-70 mt-8 p-6 border rounded-lg bg-blue-50 shadow-inner">
          <h3 className="text-xl font-bold mb-4 text-blue-800">✏️ Chỉnh sửa nguyên liệu</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border p-2 rounded-md w-full"
              placeholder="Tên nguyên liệu"
            />
            <input
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              className="border p-2 rounded-md w-full"
              placeholder="Số lượng"
            />
            <input
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              className="border p-2 rounded-md w-full"
              placeholder="Đơn giá"
            />
            <DatePicker
              selected={formData.date}
              onChange={(date) => setFormData((prev) => ({ ...prev, date }))}
              dateFormat="dd/MM/yyyy"
              locale="vi"
              placeholderText="Chọn ngày nhập hàng"
              className="border p-2 rounded-md w-full"
            />
          </div>
          <div className="mt-4 space-x-2">
            <button
              onClick={saveEdit}
              className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
            >
              💾 Lưu
            </button>
            <button
              onClick={cancelEdit}
              className="bg-gray-400 text-white px-5 py-2 rounded hover:bg-gray-500 transition"
            >
              ❌ Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
