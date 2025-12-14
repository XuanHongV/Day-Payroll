import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { BlockchainLog } from './BlockchainLog'; 
import api from '../../services/apiService';

interface PayrollRecord {
  employeeId: string;
  employeeName: string;
  totalHours: number;
  hourlyRate: number;
  totalSalary: number;
  status: 'pending' | 'paid';
  walletAddress: string;
}

export const PayrollManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'payroll' | 'history'>('payroll');
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get('/users');
      const staff = usersRes.data.filter((u: any) => u.role === 'STAFF');

      const mockPayroll: PayrollRecord[] = staff.map((u: any) => {
        const hours = Math.floor(Math.random() * (180 - 150) + 150); // Random 150-180 giờ
        const rate = 0.0005; // ETH per hour (Ví dụ)
        return {
          employeeId: u._id,
          employeeName: u.fullName,
          totalHours: hours,
          hourlyRate: rate,
          totalSalary: parseFloat((hours * rate).toFixed(4)),
          status: Math.random() > 0.7 ? 'paid' : 'pending', // Random trạng thái
          walletAddress: u.walletAddress || '0x...'
        };
      });

      setPayrollData(mockPayroll);
    } catch (error) {
      console.error("Lỗi tính lương:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, [selectedMonth]);
  const handlePay = async (record: PayrollRecord) => {
    if (!record.walletAddress || record.walletAddress.length < 10) {
      alert("Nhân viên này chưa có địa chỉ ví hợp lệ!");
      return;
    }
    
    const confirm = window.confirm(`Xác nhận thanh toán ${record.totalSalary} ETH cho ${record.employeeName}?`);
    if (!confirm) return;

    try {
      console.log(`Đang thanh toán cho ${record.employeeName}...`);

      setTimeout(() => {
        alert(`Thanh toán thành công! Transaction Hash: 0x${Math.random().toString(16).slice(2)}`);
        setPayrollData(prev => prev.map(p => 
          p.employeeId === record.employeeId ? { ...p, status: 'paid' } : p
        ));
      }, 1500);

    } catch (error) {
      alert("Thanh toán thất bại.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Bảng lương</h2>
        <p className="text-gray-600">Tính toán và thực hiện chi trả lương minh bạch qua Blockchain.</p>
      </div>

      {/* Tabs Chuyển đổi */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab('payroll')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeSubTab === 'payroll' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Bảng Tính Lương
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeSubTab === 'history' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Lịch sử Giao dịch (Blockchain)
        </button>
      </div>
      
      {activeSubTab === 'payroll' && (
        <>
          {/* Bộ lọc tháng */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center gap-4">
            <span className="text-gray-700 font-medium">Kỳ lương:</span>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="outline-none text-sm"
              />
            </div>
            <div className="ml-auto text-sm text-gray-500 italic">
              * Tỷ giá quy đổi: 1 Giờ = 0.0005 ETH (Ví dụ)
            </div>
          </div>

          {/* Bảng dữ liệu */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-gray-500">Đang tính toán bảng lương...</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6 font-semibold text-gray-700">Nhân viên</th>
                    <th className="py-4 px-6 font-semibold text-gray-700">Tổng giờ làm</th>
                    <th className="py-4 px-6 font-semibold text-gray-700">Mức lương (ETH/h)</th>
                    <th className="py-4 px-6 font-semibold text-gray-700">Thực lãnh</th>
                    <th className="py-4 px-6 font-semibold text-gray-700 text-center">Trạng thái</th>
                    <th className="py-4 px-6 font-semibold text-gray-700 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payrollData.map((record) => (
                    <tr key={record.employeeId} className="hover:bg-gray-50">
                      <td className="py-4 px-6 font-medium text-gray-900">{record.employeeName}</td>
                      <td className="py-4 px-6 text-gray-700">{record.totalHours} giờ</td>
                      <td className="py-4 px-6 text-gray-700">{record.hourlyRate} ETH</td>
                      <td className="py-4 px-6 font-bold text-blue-600">{record.totalSalary} ETH</td>
                      <td className="py-4 px-6 text-center">
                        {record.status === 'paid' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" /> Đã trả
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Chờ trả
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {record.status === 'pending' && (
                          <button 
                            onClick={() => handlePay(record)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors inline-flex items-center"
                          >
                            <CreditCard className="w-4 h-4 mr-2" /> Thanh toán
                          </button>
                        )}
                        {record.status === 'paid' && (
                          <button className="text-gray-400 text-sm cursor-not-allowed" disabled>
                            Đã hoàn tất
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
      {activeSubTab === 'history' && (
        <BlockchainLog />
      )}
    </div>
  );
};