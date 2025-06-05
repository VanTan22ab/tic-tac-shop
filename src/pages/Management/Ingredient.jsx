import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";

export default function IngredientManager() {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    unit: "",
    pricePerUnit: ""
  });
  const [editingId, setEditingId] = useState(null);

  const ingredientsRef = collection(db, "ingredients");

  const fetchIngredients = async () => {
    const snapshot = await getDocs(ingredientsRef);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setIngredients(data);
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewIngredient((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    const { name, unit, pricePerUnit } = newIngredient;
    if (!name || !unit || !pricePerUnit) return alert("Điền đầy đủ thông tin!");

    const parsedPrice = parseFloat(pricePerUnit);
    if (isNaN(parsedPrice)) return alert("Giá phải là số!");

    if (editingId) {
      const docRef = doc(db, "ingredients", editingId);
      await updateDoc(docRef, { name, unit, pricePerUnit: parsedPrice });
      setEditingId(null);
    } else {
      await addDoc(ingredientsRef, {
        name,
        unit,
        pricePerUnit: parsedPrice
      });
    }

    setNewIngredient({ name: "", unit: "", pricePerUnit: "" });
    fetchIngredients();
  };

  const handleEdit = (ingredient) => {
    setNewIngredient({
      name: ingredient.name,
      unit: ingredient.unit,
      pricePerUnit: ingredient.pricePerUnit
    });
    setEditingId(ingredient.id);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa?");
    if (!confirmed) return;
    await deleteDoc(doc(db, "ingredients", id));
    fetchIngredients();
  };

  return (
    <div className="p-6 mx-auto bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
        Quản lý nguyên liệu
      </h1>

      {/* Form thêm/sửa nguyên liệu */}
      <form
        onSubmit={handleAddOrUpdate}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <input
          type="text"
          name="name"
          placeholder="Tên nguyên liệu"
          value={newIngredient.name}
          onChange={handleChange}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="unit"
          placeholder="Đơn vị (vd: kg, lít, cái)"
          value={newIngredient.unit}
          onChange={handleChange}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          name="pricePerUnit"
          placeholder="Giá mỗi đơn vị (đ)"
          value={newIngredient.pricePerUnit}
          onChange={handleChange}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="0.01"
        />
        <button
          type="submit"
          className={`${
            editingId ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-600 hover:bg-blue-700"
          } text-white font-semibold rounded px-4 py-2 transition`}
        >
          {editingId ? "Cập nhật" : "Thêm nguyên liệu"}
        </button>
      </form>

      {/* Danh sách nguyên liệu dạng bảng */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Tên nguyên liệu</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Đơn vị</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Giá mỗi đơn vị (đ)</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  Không có nguyên liệu nào
                </td>
              </tr>
            ) : (
              ingredients.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{item.unit}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {item.pricePerUnit.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="inline-block px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded transition"
                      aria-label={`Sửa nguyên liệu ${item.name}`}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="inline-block px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition"
                      aria-label={`Xóa nguyên liệu ${item.name}`}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
