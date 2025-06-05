import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Management/DashBoard";
import CostForm from "./pages/Management/CostForm";
import RevenueForm from "./pages/Management/RevenueForm";
import Report from "./pages/Management/Report";
import PrivateRoute from "./components/PrivateRouter";
import Layout from "./Layout/Layout";
import CostManagement from "./pages/Management/CostManagement";
import RevenueManagement from "./pages/Management/RevenueManagement";
import IngredientManager from "./pages/Management/Ingredient";
import ProductCalculator from "./pages/Management/ProductCalculator";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />

        {/* Private routes - wrap Layout and nested routes with PrivateRoute */}
        <Route
          path="/"
          element={
            <PrivateRoute user={user}>
              <Layout />
            </PrivateRoute>
          }
        >
          {/* Các trang con dùng chung layout */}
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="costs" element={<CostForm />} />
          <Route path="revenues" element={<RevenueForm />} />
          <Route path="reports" element={<Report />} />
          <Route path="costs/management" element={<CostManagement />} />
          <Route path="revenues/management" element={<RevenueManagement />} />
          <Route path="ingredient" element={<IngredientManager />} />
          <Route path="product" element={<ProductCalculator />} />
        </Route>

        {/* Redirect mọi đường dẫn khác về login nếu chưa đăng nhập */}
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
