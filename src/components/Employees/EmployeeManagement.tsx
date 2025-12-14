import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { Search, Filter, Plus, Edit, X, Camera, RefreshCw, QrCode, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Employee } from '../../types';
import api from '../../services/apiService';

interface DepartmentOption {
  _id: string;
  name: string;
}

type EmployeeFormState = Omit<Employee, 'id' | 'joinDate'>;

const defaultEmployeeForm: EmployeeFormState = {
  fullName: '',
  email: '',
  position: '',
  department: '',
  walletAddress: '',
  status: 'active',
  avatar: '',
};

export const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormState>(defaultEmployeeForm);

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrEmployee, setQrEmployee] = useState<Employee | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, deptsRes] = await Promise.all([
        api.get('/users'),
        api.get('/departments')
      ]);

      const staffOnly = usersRes.data.filter((u: any) => u.role === 'STAFF');
      const mappedEmployees = staffOnly.map((u: any) => ({
        id: u._id,
        fullName: u.fullName,
        email: u.email,
        position: u.position || 'Nhân viên',
        department: u.department || 'Chưa cập nhật',
        walletAddress: u.walletAddress || '',
        status: u.status === 'ACTIVE' ? 'active' : 'inactive',
        joinDate: u.createdAt,
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}&background=random&color=fff`
      }));

      setDepartments(deptsRes.data);
      setEmployees(mappedEmployees);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = employee.fullName.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.position.toLowerCase().includes(searchLower);
    const matchesDept = filterDept === 'all' || employee.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const handleOpenModal = (employee: Employee | null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        fullName: employee.fullName,
        email: employee.email,
        position: employee.position,
        department: employee.department,
        walletAddress: employee.walletAddress,
        status: employee.status,
        avatar: employee.avatar,
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        ...defaultEmployeeForm,
        department: departments.length > 0 ? departments[0].name : ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormData(defaultEmployeeForm);
  };

  const handleOpenQr = (employee: Employee) => {
    setQrEmployee(employee);
    setQrModalOpen(true);
  };

  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL();
      const a = document.createElement('a');
      a.download = `QR_${qrEmployee?.fullName}.png`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateAvatar = () => {
    const name = formData.fullName || 'User';
    const newAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`;
    setFormData(prev => ({ ...prev, avatar: newAvatarUrl }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.department) {
      alert("Vui lòng chọn phòng ban!");
      return;
    }

    try {
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const adminCompanyCode = currentUser?.companyCode || "HONG";

      const payload = {
        ...formData,
        status: formData.status === 'active' ? 'ACTIVE' : 'INACTIVE'
      };

      if (editingEmployee) {
        await api.patch(`/users/${editingEmployee.id}`, payload);
        alert("Cập nhật thông tin thành công!");
      } else {
        const newPayload = {
          ...payload,
          password: "123456@Default",
          companyCode: adminCompanyCode,

          status: 'ACTIVE'
        };
        await api.post('/auths/registerEmployee', newPayload);
        alert("Thêm nhân viên thành công!");
      }

      fetchData();
      handleCloseModal();

    } catch (error: any) {
      console.error("Lỗi khi lưu:", error);
      const msg = error.response?.data?.message || "Có lỗi xảy ra";
      alert(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Nhân viên</h2>
        <p className="text-gray-600">Thêm, sửa, và xem thông tin chi tiết của nhân viên.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text" placeholder="Tìm nhân viên..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="all">Tất cả Phòng ban</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>
            <button onClick={() => handleOpenModal(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Plus className="h-4 w-4" /> <span>Thêm Nhân viên</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Nhân viên</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Email</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Chức vụ</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Phòng ban</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Trạng thái</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-500">Không tìm thấy nhân viên nào.</td></tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img src={employee.avatar} alt="avt" className="w-10 h-10 rounded-full object-cover border" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{employee.fullName}</p>
                          <p className="text-xs text-gray-500 font-mono">ID: {employee.id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">{employee.email}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{employee.position}</td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                        {employee.department}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(employee.status)}`}>
                        {employee.status === 'active' ? 'Hoạt động' : 'Đã nghỉ'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenQr(employee)}
                        className="text-purple-600 hover:text-purple-800 p-2 rounded-full hover:bg-purple-50"
                        title="Mã QR"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>

                      <button onClick={() => handleOpenModal(employee)} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50">
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh]">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="p-6 border-b border-gray-200 flex items-start justify-between shrink-0">
                <h2 className="text-xl font-bold text-gray-900">{editingEmployee ? 'Cập nhật Hồ sơ' : 'Thêm Nhân viên'}</h2>
                <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
              </div>
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <img src={formData.avatar || `https://ui-avatars.com/api/?name=${formData.fullName || 'User'}&background=random`} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ảnh đại diện</label>
                    <div className="flex gap-2">
                      <input type="text" name="avatar" value={formData.avatar} onChange={handleChange} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Link ảnh..." />
                      <button type="button" onClick={handleGenerateAvatar} className="px-3 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label><input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label><input type="text" name="position" value={formData.position} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
                      <select name="department" value={formData.department} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                        <option value="">-- Chọn --</option>
                        {departments.map(dept => (<option key={dept._id} value={dept.name}>{dept.name}</option>))}
                      </select>
                    </div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ Ví</label><input type="text" name="walletAddress" value={formData.walletAddress} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm" placeholder="0x..." /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label><select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"><option value="active">Hoạt động</option><option value="inactive">Đã nghỉ</option></select></div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end space-x-3 shrink-0">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">{editingEmployee ? 'Lưu' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {qrModalOpen && qrEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full text-center p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900">Mã QR Nhân Viên</h3>
              <button onClick={() => setQrModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex justify-center mb-6" ref={qrRef}>
              <QRCodeCanvas
                value={qrEmployee.id}
                size={200}
                level={"H"}
                includeMargin={true}
              />
            </div>

            <div className="mb-6">
              <p className="font-bold text-gray-800 text-lg">{qrEmployee.fullName}</p>
              <p className="text-sm text-gray-500">{qrEmployee.position}</p>
              <p className="text-xs text-gray-400 font-mono mt-1">{qrEmployee.id}</p>
            </div>

            <button
              onClick={downloadQRCode}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Tải xuống
            </button>
          </div>
        </div>
      )}

    </div>
  );
};