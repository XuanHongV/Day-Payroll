import { FormEvent, useState } from "react";
import api from "../../services/apiService";

type Props = {
  onWantLogin: () => void;
  onRegisterSuccess: () => void;
};

export default function Register({ onWantLogin, onRegisterSuccess }: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");

  const [adminFullName, setAdminFullName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (adminPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    const codeRegex = /^[a-zA-Z0-9]+$/;
    if (!codeRegex.test(code)) {
      setError("Mã công ty không được chứa khoảng trắng hoặc ký tự đặc biệt");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload = {
        name: name,
        code: code,
        phone: phone,
        adminFullName: adminFullName,
        adminEmail: adminEmail,
        adminPassword: adminPassword
      };

      await api.post("/auths/registerAdmin", payload);

      alert("Đăng ký thành công! Vui lòng kiểm tra email (nếu có) hoặc đăng nhập.");
      onRegisterSuccess();

    } catch (err: any) {
      console.error("Lỗi đăng ký:", err);
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg || "Đăng ký thất bại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-lg my-10">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Đăng ký Doanh nghiệp</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="md:col-span-2 font-semibold text-blue-600 border-b pb-2">Thông tin Công ty</div>

          <div>
            <label className="block text-sm font-medium mb-1">Tên Công ty <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Vd: Công ty TNHH ABC"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mã Công ty (Viết liền, không dấu) <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="Vd: ABCGROUP"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Số điện thoại <span className="text-red-500">*</span></label>
            <input
              type="tel"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="0905 xxx xxx"
            />
          </div>

          <div className="md:col-span-2 font-semibold text-blue-600 border-b pb-2 mt-4">Thông tin Quản trị viên</div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Họ và tên Admin <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={adminFullName}
              onChange={(e) => setAdminFullName(e.target.value)}
              required
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Email đăng nhập <span className="text-red-500">*</span></label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
              placeholder="admin@abc.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu (Tối thiểu 8 ký tự) <span className="text-red-500">*</span></label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2 mt-4">
            <button
              disabled={loading}
              className="w-full rounded-xl py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition disabled:opacity-70"
            >
              {loading ? "Đang xử lý..." : "Đăng ký Hệ thống"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm">
          Bạn đã có tài khoản?{' '}
          <button onClick={onWantLogin} className="text-blue-600 font-medium hover:underline">
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
}