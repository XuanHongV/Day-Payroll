import { FormEvent, useState } from "react";
import api from "../../services/apiService";

type Props = {
  onSuccess: (user: any) => void;
  onWantRegister?: () => void;
};

export default function Login({ onSuccess, onWantRegister }: Props) {

  const [code, setCode] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auths/signIn", {
        code: code,
        email: email,
        password: password
      });
      const token = data.access_token || data.token;
      localStorage.setItem("token", token);
      const storedUser = {
        ...data.user,
        email,
        code,
        companyId: data.user?.company || data.user?.companyId
      };
      localStorage.setItem("user", JSON.stringify(storedUser));

      onSuccess(storedUser);

    } catch (err: any) {
      console.error("Login error:", err);

      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Đăng nhập thất bại. Kiểm tra lại thông tin."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Đăng nhập Hệ thống</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 3. THÊM INPUT MÃ CÔNG TY */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã Công ty</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 uppercase" // Auto uppercase cho đẹp
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              placeholder="VD: ABCGROUP"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="admin@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-70 mt-2"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Bạn chưa có tài khoản?{' '}
          <button
            type="button"
            onClick={onWantRegister}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition"
          >
            Đăng ký Doanh nghiệp mới
          </button>
        </p>
      </div>
    </div>
  );
}