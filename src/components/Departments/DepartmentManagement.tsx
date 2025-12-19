import React, { useState, FormEvent } from 'react';
import { 
  Search, Plus, Edit, Trash2, X, RefreshCw, Users, 
  Building, ChevronLeft, ChevronRight, Coins, Wallet
} from 'lucide-react';

interface EmployeeShort {
  id: string;
  fullName: string;
  position: string;
  email: string;
  avatar: string;
  departmentId: string;
}

interface Department {
  id: string;
  code: string;       // Mã phòng ban
  name: string;       // Tên phòng ban
  manager: string;    // Trưởng phòng
  location: string;   // Vị trí (Tầng 5, Lab 1...)
  budget: number;     // Ngân sách
  currency: 'ETH' | 'USDT' | 'VND'; // Đơn vị tiền tệ (Blockchain context)
  status: 'active' | 'inactive';
  description?: string;
}

// Dữ liệu Phòng ban giả lập
const MOCK_DEPARTMENTS: Department[] = [
  { id: '1', code: 'PB-001', name: 'Ban Giám Đốc', manager: 'Nguyễn Văn A', location: 'Tầng 10 - VIP', budget: 100000, currency: 'USDT', status: 'active', description: 'Điều hành chung' },
  { id: '2', code: 'PB-002', name: 'Blockchain Core', manager: 'Trần Văn B', location: 'Lab 1 - Khu A', budget: 50, currency: 'ETH', status: 'active', description: 'Phát triển Smart Contract & Node' },
  { id: '3', code: 'PB-003', name: 'AI Research (R&D)', manager: 'Lê Thị C', location: 'Lab 2 - Khu A', budget: 40, currency: 'ETH', status: 'active', description: 'Nghiên cứu mô hình AI chấm công' },
  { id: '4', code: 'PB-004', name: 'Phòng Nhân sự (HR)', manager: 'Phạm Thị D', location: 'Tầng 2', budget: 5000, currency: 'USDT', status: 'active', description: 'Tuyển dụng & C&B' },
  { id: '5', code: 'PB-005', name: 'Phòng Tài chính', manager: 'Hoàng Văn E', location: 'Tầng 3', budget: 8000, currency: 'USDT', status: 'active', description: 'Kế toán & Trả lương' },
  { id: '6', code: 'PB-006', name: 'Kho vận & Hậu cần', manager: 'Võ Văn F', location: 'Kho B', budget: 2000, currency: 'USDT', status: 'active', description: 'Quản lý tài sản' },
];

// Dữ liệu Nhân viên giả lập (để xem chi tiết)
const MOCK_EMPLOYEES: EmployeeShort[] = [
  { id: '1', fullName: 'Nguyễn Văn Liệt', position: 'Dev Solidity', email: 'liet@example.com', avatar: '', departmentId: '2' },
  { id: '2', fullName: 'Lưu Thủy Bình', position: 'AI Engineer', email: 'binh@example.com', avatar: '', departmentId: '3' },
  { id: '3', fullName: 'Nguyễn Ánh Bằng', position: 'HR Manager', email: 'bang@example.com', avatar: '', departmentId: '4' },
  { id: '4', fullName: 'Trần Thái Cường', position: 'Dev Frontend', email: 'cuong@example.com', avatar: '', departmentId: '2' },
  { id: '5', fullName: 'Lê Thị Mận', position: 'Tester', email: 'man@example.com', avatar: '', departmentId: '2' },
];

const defaultForm: Omit<Department, 'id'> = {
  code: '', name: '', manager: '', location: '', budget: 0, currency: 'USDT', status: 'active', description: ''
};

export const DepartmentManagement: React.FC = () => {
  // --- STATE ---
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultForm);

  // Modal View Employees
  const [viewEmpModalOpen, setViewEmpModalOpen] = useState(false);
  const [selectedDeptForView, setSelectedDeptForView] = useState<Department | null>(null);

  // --- LOGIC ---

  // 1. Filter & Pagination
  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDepts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDepts.length / itemsPerPage);

  const getEmployeeCount = (deptId: string) => {
    return MOCK_EMPLOYEES.filter(e => e.departmentId === deptId).length;
  };

  // 2. Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(currentItems.map(i => i.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(i => i !== id));
    else setSelectedIds(prev => [...prev, id]);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng ban này?")) {
      setDepartments(prev => prev.filter(d => d.id !== id));
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Xóa ${selectedIds.length} phòng ban đã chọn?`)) {
      setDepartments(prev => prev.filter(d => !selectedIds.includes(d.id)));
      setSelectedIds([]);
    }
  };

  const handleOpenModal = (dept: Department | null) => {
    if (dept) {
      setEditingId(dept.id);
      setFormData(dept);
    } else {
      setEditingId(null);
      setFormData({ ...defaultForm, code: `PB-00${Math.floor(Math.random()*100)}` });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setDepartments(prev => prev.map(d => d.id === editingId ? { ...formData, id: editingId } : d));
    } else {
      setDepartments(prev => [...prev, { ...formData, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
  };

  const handleViewEmployees = (dept: Department) => {
    setSelectedDeptForView(dept);
    setViewEmpModalOpen(true);
  };

  // --- RENDER ---
  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans text-sm">
      
      {/* HEADER */}
      <div className="bg-white px-5 py-4 flex justify-between items-center shadow-sm border-b border-gray-200">
        <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-800 uppercase tracking-tight">DANH MỤC PHÒNG BAN</h1>
            <p className="text-xs text-gray-500 mt-0.5">Cơ cấu tổ chức & Ngân sách</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Tìm theo mã, tên, quản lý..." 
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded text-sm w-72 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            </div>

            {selectedIds.length > 0 && (
                 <button 
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-1 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded font-bold hover:bg-red-100 transition-colors animate-in fade-in"
                >
                    <Trash2 className="w-4 h-4" /> Xóa ({selectedIds.length})
                </button>
            )}

            <button onClick={() => window.location.reload()} className="p-2 text-gray-600 hover:bg-gray-100 rounded border border-gray-300 shadow-sm" title="Tải lại">
                <RefreshCw className="w-4 h-4" />
            </button>
            
            <button 
                onClick={() => handleOpenModal(null)}
                className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 transition-all flex items-center gap-2 shadow-sm font-medium"
            >
                <Plus className="w-5 h-5" /> Thêm phòng ban
            </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white border border-gray-300 shadow rounded-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wider sticky top-0 z-10 border-b border-gray-200">
                    <tr>
                        <th className="p-3 border-r border-gray-200 w-10 text-center">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded text-green-600 focus:ring-green-500 cursor-pointer"
                                checked={currentItems.length > 0 && selectedIds.length === currentItems.length}
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th className="p-3 border-r border-gray-200 min-w-[100px]">Mã PB</th>
                        <th className="p-3 border-r border-gray-200 min-w-[200px]">Tên phòng ban</th>
                        <th className="p-3 border-r border-gray-200 min-w-[150px]">Quản lý (Manager)</th>
                        <th className="p-3 border-r border-gray-200 min-w-[150px]">Vị trí</th>
                        <th className="p-3 border-r border-gray-200 min-w-[100px] text-center">Nhân sự</th>
                        <th className="p-3 border-r border-gray-200 min-w-[150px] text-right">Ngân sách (Tháng)</th>
                        <th className="p-3 border-r border-gray-200 min-w-[100px] text-center">Trạng thái</th>
                        <th className="p-3 border-b border-gray-200 text-center min-w-[120px] sticky right-0 bg-gray-100 shadow-l">CHỨC NĂNG</th>
                    </tr>
                </thead>
                <tbody className="text-gray-800 text-sm">
                    {currentItems.map((dept) => (
                        <tr key={dept.id} className={`hover:bg-blue-50 transition-colors border-b border-gray-100 group ${selectedIds.includes(dept.id) ? 'bg-green-50' : ''}`}>
                            <td className="p-2 border-r border-gray-100 text-center">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded text-green-600 focus:ring-green-500 cursor-pointer"
                                    checked={selectedIds.includes(dept.id)}
                                    onChange={() => handleSelectOne(dept.id)}
                                />
                            </td>
                            <td className="p-2 border-r border-gray-100">{dept.code}</td>
                            <td className="p-2 border-r border-gray-100 font-bold text-gray-800 flex items-center gap-2">
                                <Building size={14} className="text-blue-500"/> {dept.name}
                            </td>
                            <td className="p-2 border-r border-gray-100">{dept.manager}</td>
                            <td className="p-2 border-r border-gray-100">{dept.location}</td>
                            <td className="p-2 border-r border-gray-100 text-center">
                                <button 
                                  onClick={() => handleViewEmployees(dept)}
                                  className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold hover:bg-blue-200 transition-colors flex items-center gap-1 justify-center mx-auto"
                                >
                                  <Users size={12}/> {getEmployeeCount(dept.id)}
                                </button>
                            </td>
                            <td className="p-2 border-r border-gray-100 text-right font-mono text-green-700 font-bold">
                                {dept.budget.toLocaleString()} {dept.currency}
                            </td>
                            <td className="p-2 border-r border-gray-100 text-center">
                                {dept.status === 'active' ? (
                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full border border-green-200">Đang hoạt động</span>
                                ) : (
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200">Ngừng hoạt động</span>
                                )}
                            </td>
                            <td className="p-2 text-center sticky right-0 bg-white group-hover:bg-blue-50 shadow-l border-l border-gray-100">
                                <div className="flex items-center justify-center gap-3">
                                    <span 
                                        className="text-blue-600 font-bold text-xs cursor-pointer hover:underline uppercase"
                                        onClick={() => handleOpenModal(dept)}
                                    >
                                        Sửa
                                    </span>
                                    <button onClick={() => handleDelete(dept.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Xóa">
                                        <Trash2 size={15}/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {/* Hàng trống */}
                    {Array.from({length: Math.max(0, 10 - currentItems.length)}).map((_, i) => (
                        <tr key={`empty-${i}`}><td colSpan={9} className="p-4 border-b border-gray-50">&nbsp;</td></tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* FOOTER PAGINATION */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center text-xs text-gray-600">
        <div>
            Tổng số: <span className="font-bold text-gray-900">{filteredDepts.length}</span> phòng ban | Đang chọn: <span className="font-bold text-green-600">{selectedIds.length}</span>
        </div>
        <div className="flex items-center gap-4">
            <select 
                value={itemsPerPage} 
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 outline-none focus:border-green-600"
            >
                <option value={10}>10 bản ghi/trang</option>
                <option value={20}>20 bản ghi/trang</option>
            </select>
            <div className="flex items-center gap-1">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={currentPage === 1}
                    className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                    <ChevronLeft size={14} />
                </button>
                <span className="px-2">Trang {currentPage}</span>
                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
      </div>

      {/* --- MODAL ADD/EDIT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Building className="text-green-600" size={20} />
                {editingId ? 'Cập nhật Phòng ban' : 'Thêm Phòng ban mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24}/></button>
            </div>
            
            <div className="p-6 bg-white">
              <form id="deptForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Mã phòng ban <span className="text-red-500">*</span></label>
                        <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-3 h-9 border border-gray-300 rounded text-sm focus:border-green-600 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Trạng thái</label>
                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-3 h-9 border border-gray-300 rounded text-sm focus:border-green-600 bg-white">
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Ngừng hoạt động</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tên phòng ban <span className="text-red-500">*</span></label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 h-9 border border-gray-300 rounded text-sm focus:border-green-600 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Quản lý (Manager)</label>
                        <input type="text" value={formData.manager} onChange={e => setFormData({...formData, manager: e.target.value})} className="w-full px-3 h-9 border border-gray-300 rounded text-sm focus:border-green-600 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Vị trí</label>
                        <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-3 h-9 border border-gray-300 rounded text-sm focus:border-green-600 outline-none" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Ngân sách (Tháng)</label>
                        <input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: parseInt(e.target.value)})} className="w-full px-3 h-9 border border-gray-300 rounded text-sm focus:border-green-600 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Loại tiền tệ</label>
                        <div className="relative">
                            <Wallet size={14} className="absolute left-2.5 top-2.5 text-blue-600"/>
                            <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value as any})} className="w-full pl-8 pr-3 h-9 border border-gray-300 rounded text-sm focus:border-green-600 bg-white appearance-none">
                                <option value="ETH">ETH (Ethereum)</option>
                                <option value="USDT">USDT (Tether)</option>
                                <option value="VND">VND</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Mô tả / Chức năng</label>
                    <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 h-9 border border-gray-300 rounded text-sm focus:border-green-600 outline-none" />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
               <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-400 text-gray-700 rounded text-sm font-medium hover:bg-gray-100">Hủy</button>
               <button 
                 onClick={() => document.getElementById('deptForm')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
                 className="px-4 py-2 bg-green-600 text-white rounded text-sm font-bold hover:bg-green-700 shadow-sm"
               >
                 {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL VIEW EMPLOYEES --- */}
      {viewEmpModalOpen && selectedDeptForView && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in duration-200">
               <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-blue-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Danh sách nhân sự</h3>
                        <p className="text-sm text-gray-500">Phòng ban: <span className="font-bold text-blue-700">{selectedDeptForView.name}</span></p>
                    </div>
                    <button onClick={() => setViewEmpModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24}/></button>
               </div>
               
               <div className="flex-1 overflow-auto p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th className="p-3 text-xs font-bold text-gray-600 border-b">Họ và tên</th>
                                <th className="p-3 text-xs font-bold text-gray-600 border-b">Vị trí</th>
                                <th className="p-3 text-xs font-bold text-gray-600 border-b">Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_EMPLOYEES.filter(e => e.departmentId === selectedDeptForView.id).length > 0 ? (
                                MOCK_EMPLOYEES.filter(e => e.departmentId === selectedDeptForView.id).map(emp => (
                                    <tr key={emp.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                {emp.fullName.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-gray-800">{emp.fullName}</span>
                                        </td>
                                        <td className="p-3 text-sm text-gray-600">{emp.position}</td>
                                        <td className="p-3 text-sm text-gray-600">{emp.email}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-gray-500 italic">Chưa có nhân viên nào trong phòng ban này.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
               </div>
               
               <div className="p-4 border-t bg-gray-50 text-right">
                    <button onClick={() => setViewEmpModalOpen(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium">Đóng</button>
               </div>
           </div>
        </div>
      )}

    </div>
  );
};