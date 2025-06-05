import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { Link, useNavigate } from "react-router-dom";
import { PiEye, PiEyeSlash } from "react-icons/pi";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: serverTimestamp(),
        role: "admin",
      });

      alert("Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.");
      navigate("/login");
    } catch (error) {
      console.error("Firebase Register Error:", error);

      switch (error.code) {
        case "auth/email-already-in-use":
          setErr("Email đã tồn tại!");
          break;
        case "auth/invalid-email":
          setErr("Email không hợp lệ!");
          break;
        case "auth/weak-password":
          setErr("Mật khẩu quá yếu, cần ít nhất 6 ký tự!");
          break;
        default:
          setErr("Đăng ký thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md text-center">
        <img
          src="/logo.png"
          alt="Snackify Logo"
          className="w-20 h-20 mx-auto mb-4 rounded-2xl"
        />
        <h2 className="text-3xl font-extrabold text-pink-600 mb-6 font-[cursive]">
          Tíc Tắc Shop
        </h2>
        <h3 className="text-lg font-semibold mb-6 text-gray-700">
          Tạo tài khoản mới và chill 😋
        </h3>
        <form
          onSubmit={handleRegister}
          className="space-y-5 text-left relative"
        >
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-700"
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
              className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 pr-10 text-gray-700"
              onChange={(e) => {
                setPassword(e.target.value);
                setErr(null);
              }}
              required
              minLength={6}
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
            className={`w-full py-3 rounded-lg font-semibold text-white text-lg transition ${
              loading
                ? "bg-pink-300 cursor-not-allowed"
                : "bg-pink-500 hover:bg-pink-600"
            }`}
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-500">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-pink-500 hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
