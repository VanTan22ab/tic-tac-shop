import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import { PiEye, PiEyeSlash } from "react-icons/pi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      setErr("Email hoặc mật khẩu không đúng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md text-center">
        <img
          src="/logo.png"
          alt="Snackify Logo"
          className="w-20 h-20 mx-auto mb-4 rounded-2xl"
        />
        <h2 className="text-3xl font-extrabold text-pink-600 mb-6 font-[cursive]">
          Tíc Tắc Shop
        </h2>
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Quản lí chi tiêu thật dễ với a Lụi 😋
        </h3>
        <form onSubmit={handleLogin} className="space-y-4 text-left relative">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            onChange={(e) => {
              setEmail(e.target.value);
              setErr(null);
            }}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 pr-10"
              onChange={(e) => {
                setPassword(e.target.value);
                setErr(null);
              }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-pink-500 hover:text-pink-700"
              tabIndex={-1}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <PiEyeSlash size={24} weight="bold" />
              ) : (
                <PiEye size={24} weight="bold" />
              )}
            </button>
          </div>

          {err && <p className="text-red-500 text-sm">{err}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold text-white text-lg transition ${
              loading ? "bg-pink-300 cursor-not-allowed" : "bg-pink-500 hover:bg-pink-600"
            }`}
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-pink-500 hover:underline">
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
}
