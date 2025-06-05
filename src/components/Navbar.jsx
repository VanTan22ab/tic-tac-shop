import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { MdLogout, MdAccountCircle } from "react-icons/md";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  return (
    <header className="flex sm:flex-row items-center justify-between gap-2 sm:gap-0 p-4 bg-gradient-to-r from-yellow-400 via-pink-400 to-pink-600 rounded-b-lg shadow-md">
      {/* Logo ảnh ở mobile, tiêu đề ở desktop */}
      <div>
        {/* Logo cho mobile */}
        <img
          src="/logo.png" // Đảm bảo bạn có file logo ở public/logo.png hoặc cập nhật path cho đúng
          alt="Logo"
          className="h-10 block rounded-full sm:hidden"
        />
        {/* Tiêu đề cho desktop */}
        <h1 className="hidden sm:block text-3xl font-extrabold text-white drop-shadow-md">
          Welcome to Tic Tac Dashboard
        </h1>
      </div>

      {/* User info */}
      {user ? (
        <div className="flex sm:flex-row items-center gap-2 bg-white bg-opacity-30 backdrop-blur-sm rounded-full px-4 py-2 shadow-inner w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <MdAccountCircle className="text-2xl sm:text-3xl" />
            <span className="font-medium text-sm sm:text-base truncate max-w-[150px] sm:max-w-xs">
              {user.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 sm:gap-2 bg-pink-700 hover:bg-pink-800 text-white rounded-full px-3 py-1 text-sm font-semibold transition-colors shadow w-fit"
            title="Đăng xuất"
          >
            <MdLogout size={20} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      ) : (
        <span className="text-white font-semibold italic text-center sm:text-right w-full sm:w-auto">
          Chưa đăng nhập
        </span>
      )}
    </header>
  );
}
