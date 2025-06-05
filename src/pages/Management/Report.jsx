import { useEffect, useState } from "react";
import { getCosts, getRevenues } from "../../firebase/firebaseService";
import {
  calculateTotalCost,
  calculateTotalRevenue,
  calculateVatTax,
  calculateProfit,
} from "../../utils/taxUtils";
import { exportReportToExcel } from "../../utils/excelUtils";
import { auth } from "../../firebase/config";

export default function Report() {
  const [costs, setCosts] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const user = auth.currentUser;
        if (!user) {
          alert("Bạn cần đăng nhập để xem báo cáo");
          setLoading(false);
          return;
        }
        const userId = user.uid;

        const costsData = await getCosts(userId);
        const revenuesData = await getRevenues(userId);

        setCosts(costsData);
        setRevenues(revenuesData);
      } catch (error) {
        alert("Lỗi khi tải dữ liệu: " + error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filterByMonth = (data, monthString) => {
    if (!monthString) return data;
    return data.filter((item) => {
      if (!item.date) return false;
      return item.date.slice(0, 7) === monthString;
    });
  };

  const filteredCosts = filterByMonth(costs, selectedMonth);
  const filteredRevenues = filterByMonth(revenues, selectedMonth);

  const totalCost = calculateTotalCost(filteredCosts);
  const totalRevenue = calculateTotalRevenue(filteredRevenues);
  const vatTax = calculateVatTax(totalRevenue);
  const profit = calculateProfit(totalRevenue, totalCost, vatTax);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">Báo cáo Doanh thu & Thuế</h2>

      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2">
          <label htmlFor="month" className="font-medium text-gray-700">Chọn tháng:</label>
          <input
            id="month"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Đang tải dữ liệu...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white shadow rounded p-4 border-l-4 border-red-500">
            <p className="text-gray-600">Tổng chi phí</p>
            <h3 className="text-xl font-bold text-red-600">{totalCost.toLocaleString()} VNĐ</h3>
          </div>

          <div className="bg-white shadow rounded p-4 border-l-4 border-green-500">
            <p className="text-gray-600">Tổng doanh thu</p>
            <h3 className="text-xl font-bold text-green-600">{totalRevenue.toLocaleString()} VNĐ</h3>
          </div>

          <div className="bg-white shadow rounded p-4 border-l-4 border-yellow-500">
            <p className="text-gray-600">Thuế VAT (10%)</p>
            <h3 className="text-xl font-bold text-yellow-600">{vatTax.toLocaleString()} VNĐ</h3>
          </div>

          <div className="bg-white shadow rounded p-4 border-l-4 border-blue-500">
            <p className="text-gray-600">Lợi nhuận</p>
            <h3 className="text-xl font-bold text-blue-600">{profit.toLocaleString()} VNĐ</h3>
          </div>
        </div>
      )}

      {!loading && (
        <div className="flex justify-center">
          <button
            onClick={() =>
              exportReportToExcel(
                filteredCosts,
                filteredRevenues,
                totalCost,
                totalRevenue,
                vatTax,
                profit
              )
            }
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded shadow"
          >
            📤 Xuất file Excel
          </button>
        </div>
      )}
    </div>
  );
}
