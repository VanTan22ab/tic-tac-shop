import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  getCosts,
  getRevenues,
} from "../../firebase/firebaseService";
import { auth } from "../../firebase/config";
import {
  calculateTotalCost,
  calculateTotalRevenue,
  calculateVatTax,
} from "../../utils/taxUtils";
import { FaMoneyBillWave, FaBoxes, FaReceipt } from "react-icons/fa";

function Dashboard() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [vatTax, setVatTax] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ Lấy tháng hiện tại theo giờ hệ thống
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const currentMonth = `${year}-${month}`; // ví dụ: "2025-05"

  const filterByMonth = (data, monthString) => {
    if (!monthString) return data;
    return data.filter((item) => item.date && item.date.slice(0, 7) === monthString);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        const revenues = await getRevenues(user.uid);
        const costs = await getCosts(user.uid);

        const filteredRevenues = filterByMonth(revenues, currentMonth);
        const filteredCosts = filterByMonth(costs, currentMonth);

        const revenueValue = calculateTotalRevenue(filteredRevenues);
        const costValue = calculateTotalCost(filteredCosts);
        const taxValue = calculateVatTax(revenueValue);

        setTotalRevenue(revenueValue);
        setTotalCost(costValue);
        setVatTax(taxValue);
      } catch (error) {
        alert("Lỗi khi tải dữ liệu tổng quan: " + error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const overviewData = [
    {
      name: "Tháng này",
      DoanhThu: totalRevenue,
      ChiPhi: totalCost,
      Thue: vatTax,
    },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-yellow-50 via-white to-pink-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-4 text-pink-700">
        📊 Tổng quan doanh thu
      </h1>
      <p className="text-gray-600 text-md mb-8">
        Dữ liệu được tổng hợp theo tháng hiện tại ({currentMonth}).
      </p>

      {/* Thẻ thông tin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-5 bg-blue-100 border-l-4 border-blue-400 rounded-lg shadow flex items-center gap-4">
          <FaMoneyBillWave className="text-4xl text-blue-500" />
          <div>
            <h2 className="text-md font-semibold text-blue-700">
              Doanh thu tháng này
            </h2>
            <p className="text-xl font-bold text-blue-800">
              {loading ? "..." : `₫${totalRevenue.toLocaleString()}`}
            </p>
          </div>
        </div>

        <div className="p-5 bg-green-100 border-l-4 border-green-400 rounded-lg shadow flex items-center gap-4">
          <FaBoxes className="text-4xl text-green-500" />
          <div>
            <h2 className="text-md font-semibold text-green-700">
              Tổng chi phí nguyên liệu
            </h2>
            <p className="text-xl font-bold text-green-800">
              {loading ? "..." : `₫${totalCost.toLocaleString()}`}
            </p>
          </div>
        </div>

        <div className="p-5 bg-yellow-100 border-l-4 border-yellow-400 rounded-lg shadow flex items-center gap-4">
          <FaReceipt className="text-4xl text-yellow-500" />
          <div>
            <h2 className="text-md font-semibold text-yellow-700">
              Thuế ước tính (10%)
            </h2>
            <p className="text-xl font-bold text-yellow-800">
              {loading ? "..." : `₫${vatTax.toLocaleString()}`}
            </p>
          </div>
        </div>
      </div>

      {/* Biểu đồ cột */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          📊 Biểu đồ tổng quan
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={overviewData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `₫${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="DoanhThu" fill="#3b82f6" />
            <Bar dataKey="ChiPhi" fill="#10b981" />
            <Bar dataKey="Thue" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;
