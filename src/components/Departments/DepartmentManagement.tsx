import React, { useState, useEffect, FormEvent } from 'react';
import { Building, Users, Plus, Edit, X, Loader2 } from 'lucide-react';
import { Employee } from '../../types'; 
import api from '../../services/apiService'; 

interface Department {
  id: string;
  name: string;
  manager: string;
  employeeCount: number;
  budget: number;
  currency: string;
}

type DepartmentFormState = Omit<Department, 'id' | 'employeeCount' | 'currency'>;

const defaultDepartmentForm: DepartmentFormState = {
  name: '',
  manager: '',
  budget: 0,
};

export const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentFormState>(defaultDepartmentForm);

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, userRes] = await Promise.all([
        api.get('/departments'),
        api.get('/users')
      ]);

      const fetchedEmployees = userRes.data.map((u: any) => ({
        id: u._id,
        fullName: u.fullName,
        email: u.email,
        position: u.position || (u.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'),
        department: u.department || 'Chưa cập nhật',
        walletAddress: u.walletAddress,
        status: u.status === 'ACTIVE' ? 'active' : 'inactive',
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}&background=random`
      }));
      setAllEmployees(fetchedEmployees);
      
      const fetchedDepartments = deptRes.data.map((d: any) => {
      
      const count = fetchedEmployees.filter((e: any) => e.department === d.name).length;
        
        return {
          id: d._id,
          name: d.name,
          manager: d.manager,
          budget: d.budget,
          currency: d.currency || 'ETH',
          employeeCount: count 
        };
      });
      setDepartments(fetchedDepartments);

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        
        await api.patch(`/departments/${editingDepartment.id}`, formData);
        alert("Cập nhật phòng ban thành công!");
      } else {
        
        await api.post('/departments', {
          ...formData,
          currency: 'ETH'
        });
        alert("Tạo phòng ban mới thành công!");
      }
      
      fetchData();
      handleCloseModal();

    } catch (error: any) {
      console.error("Lỗi lưu phòng ban:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  
  const handleOpenModal = (dept: Department | null) => {
    if (dept) {
      setEditingDepartment(dept);
      setFormData({ name: dept.name, manager: dept.manager, budget: dept.budget });
    } else {
      setEditingDepartment(null);
      setFormData(defaultDepartmentForm);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDepartment(null);
    setFormData(defaultDepartmentForm);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'budget' ? parseInt(value) || 0 : value }));
  };

  const handleOpenEmployeeModal = (dept: Department) => {
    setSelectedDepartment(dept);
    setIsEmployeeModalOpen(true);
  };

  const handleCloseEmployeeModal = () => {
    setIsEmployeeModalOpen(false);
    setSelectedDepartment(null);
  };
  
  if (loading) return (
    <div className="p-10 text-center text-gray-500 flex flex-col items-center">
      <Loader2 className="animate-spin h-8 w-8 mb-2 text-blue-600" />
      <p>Đang tải dữ liệu phòng ban...</p>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Phòng ban</h2>
        <p className="text-gray-600">Quản lý ngân sách và thông tin các phòng ban.</p>
      </div>

      <div className="flex justify-end mb-6">
        <button
          onClick={() => handleOpenModal(null)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo Phòng ban mới</span>
        </button>
      </div>

      {/*Phòng ban */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Phòng ban</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Quản lý</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Số lượng NV</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Ngân sách (Tháng)</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    Chưa có phòng ban nào. Hãy tạo mới.
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          <Building className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                          <p className="text-xs text-gray-500 font-mono text-[10px]">{dept.id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700 font-medium">{dept.manager}</td>
                    
                    
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleOpenEmployeeModal(dept)}
                        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                        title="Xem danh sách nhân viên"
                      >
                        <Users className="h-4 w-4" />
                        <span className="font-semibold">{dept.employeeCount}</span>
                      </button>
                    </td>
                    
                    <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                      {dept.budget.toLocaleString()} {dept.currency}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleOpenModal(dept)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                        title="Chỉnh sửa"
                      >
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

      {/* Thêm/Sửa Pban */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingDepartment ? 'Cập nhật Phòng ban' : 'Tạo Phòng ban mới'}
                </h2>
                <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên phòng ban</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Kế toán" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Quản lý</label>
                  <select 
                    name="manager" 
                    value={formData.manager} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none"
                    required
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {allEmployees.map((emp) => (
                      <option key={emp.id} value={emp.fullName}>
                        {emp.fullName} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngân sách (ETH)</label>
                  <input type="number" name="budget" value={formData.budget} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm">{editingDepartment ? 'Lưu' : 'Tạo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* list Nhân viên */}
      {isEmployeeModalOpen && selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Danh sách Nhân viên</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Phòng: <span className="font-semibold text-blue-600">{selectedDepartment.name}</span>
                </p>
              </div>
              <button type="button" onClick={() => setIsEmployeeModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-0 overflow-y-auto flex-1">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Nhân viên</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Chức vụ</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allEmployees.filter(emp => emp.department === selectedDepartment.name).length > 0 ? (
                    allEmployees
                      .filter(emp => emp.department === selectedDepartment.name)
                      .map(emp => (
                        <tr key={emp.id} className="hover:bg-gray-50">
                          <td className="py-3 px-6">
                            <div className="flex items-center space-x-3">
                              <img src={emp.avatar} alt="avt" className="w-8 h-8 rounded-full border" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{emp.fullName}</p>
                                <p className="text-[10px] text-gray-500 font-mono">{emp.id.slice(-6)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-6 text-sm text-gray-700">{emp.position}</td>
                          <td className="py-3 px-6 text-sm text-gray-700">{emp.email}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-gray-500">
                        Chưa có nhân viên nào trong phòng ban này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end shrink-0">
              <button onClick={() => setIsEmployeeModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};