import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function ProductCalculator() {
  const [ingredients, setIngredients] = useState([]);
  const [selected, setSelected] = useState([]);

  const fetchIngredients = async () => {
    const snapshot = await getDocs(collection(db, "ingredients"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setIngredients(data);
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleSelectIngredient = (ingredientId) => {
    if (selected.some((item) => item.id === ingredientId)) return;

    const found = ingredients.find((i) => i.id === ingredientId);
    if (found) {
      setSelected((prev) => [...prev, { ...found, quantityUsed: 0 }]);
    }
  };

  const handleChangeQuantity = (id, value) => {
    const quantity = parseFloat(value) || 0;
    setSelected((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantityUsed: quantity } : item
      )
    );
  };

  const handleRemove = (id) => {
    setSelected((prev) => prev.filter((item) => item.id !== id));
  };

  const totalCost = selected.reduce(
    (sum, item) => sum + item.quantityUsed * item.pricePerUnit,
    0
  );

  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Tính toán chi phí bịch bánh
      </h1>

      {/* Chọn nguyên liệu */}
      <div className="mb-6">
        <label
          htmlFor="ingredient-select"
          className="block mb-2 text-lg font-semibold text-gray-700"
        >
          Chọn nguyên liệu
        </label>
        <select
          id="ingredient-select"
          onChange={(e) => handleSelectIngredient(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          defaultValue=""
        >
          <option value="" disabled>
            -- Chọn nguyên liệu --
          </option>
          {ingredients.map((ingredient) => (
            <option key={ingredient.id} value={ingredient.id}>
              {ingredient.name} ({ingredient.unit}) -{" "}
              {ingredient.pricePerUnit.toLocaleString()} đ
            </option>
          ))}
        </select>
      </div>

      {/* Danh sách nguyên liệu đã chọn */}
      {selected.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3 border-b border-gray-300 font-semibold text-gray-700">
                  Nguyên liệu
                </th>
                <th className="text-right p-3 border-b border-gray-300 font-semibold text-gray-700">
                  Giá / {selected[0]?.unit}
                </th>
                <th className="text-right p-3 border-b border-gray-300 font-semibold text-gray-700">
                  Số lượng sử dụng
                </th>
                <th className="p-3 border-b border-gray-300 font-semibold text-gray-700 text-center">
                  Tổng tiền
                </th>
                <th className="p-3 border-b border-gray-300"></th>
              </tr>
            </thead>
            <tbody>
              {selected.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-3 border-b border-gray-200 font-medium text-gray-800">
                    {item.name}
                  </td>
                  <td className="p-3 border-b border-gray-200 text-right text-gray-700">
                    {item.pricePerUnit.toLocaleString()} đ
                  </td>
                  <td className="p-3 border-b border-gray-200 text-right">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-24 border border-gray-300 rounded px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={item.quantityUsed}
                      onChange={(e) =>
                        handleChangeQuantity(item.id, e.target.value)
                      }
                      aria-label={`Số lượng sử dụng của ${item.name}`}
                    />
                    <span className="ml-2 text-gray-600">{item.unit}</span>
                  </td>
                  <td className="p-3 border-b border-gray-200 text-right font-semibold text-green-600">
                    {(item.quantityUsed * item.pricePerUnit).toLocaleString()} đ
                  </td>
                  <td className="p-3 border-b border-gray-200 text-center">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-600 hover:text-red-800 font-semibold transition"
                      aria-label={`Xóa nguyên liệu ${item.name}`}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tổng chi phí */}
      <div className="mt-8 text-right text-2xl font-bold text-gray-900">
        Tổng chi phí:{" "}
        <span className="text-green-700">
          {totalCost.toLocaleString()} đ / bịch bánh
        </span>
      </div>
    </div>
  );
}
