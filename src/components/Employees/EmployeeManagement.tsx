import React, { useState, FormEvent, useRef } from 'react';
import { 
  Search, Plus, X, RefreshCw, QrCode, Download, 
  FileText, ChevronLeft, ChevronRight, Trash2, FileSpreadsheet, Wallet
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

// --- 1. ĐỊNH NGHĨA DATA TYPE & MOCK DATA ---
interface Employee {
  id: string;
  code: string;         // Mã NV
  fullName: string;     // Tên nhân viên
  gender: 'Nam' | 'Nữ' | 'Khác';
  dob: string;          // Ngày sinh
  cmnd: string;         // Số CMND
  position: string;     // Chức danh
  department: string;   // Tên đơn vị
  bankAccount: string;  // Số tài khoản
  bankName: string;     // Tên ngân hàng
  bankBranch: string;   // Chi nhánh
  
  // Dữ liệu Blockchain & AI Project
  walletAddress: string; 
  email: string;
  address: string;
  mobile: string;
  landline: string;
  issueDate: string;
  issuePlace: string;
  status: 'active' | 'inactive';
}

const MOCK_DEPARTMENTS = [
  'Phòng Nhân sự', 'Phòng Kỹ thuật (Tech)', 'Phòng Kế toán', 'Ban Giám đốc', 'Kho vận', 'Sản xuất'
];

const INITIAL_DATA: Employee[] = [
  {
    id: '1', code: 'NV-00012', fullName: 'Nguyễn Văn Liệt', gender: 'Nam', dob: '31/12/1989', cmnd: '362520365', position: 'Trưởng nhóm', department: 'Sản xuất', 
    bankAccount: '1903333333', bankName: 'Vietcombank', bankBranch: 'TP.HCM', walletAddress: '0x71C...9A2',
    email: 'lietnv@example.com', address: 'TP.HCM', mobile: '0909123456', landline: '', issueDate: '01/01/2010', issuePlace: 'HCM', status: 'active'
  },
  {
    id: '2', code: 'NV-000575', fullName: 'Lưu Thủy Bình', gender: 'Nam', dob: '15/05/1990', cmnd: '385659258', position: 'Nhân viên', department: 'Phòng Kỹ thuật (Tech)', 
    bankAccount: '', bankName: '', bankBranch: '', walletAddress: '0x82B...1C4',
    email: 'binhlt@example.com', address: 'Hà Nội', mobile: '0912345678', landline: '', issueDate: '15/05/2012', issuePlace: 'Hà Nội', status: 'active'
  },
  {
    id: '3', code: 'NV-1644', fullName: 'Nguyễn Ánh Bằng', gender: 'Nam', dob: '16/12/1980', cmnd: '6013758468', position: 'Lễ tân chính', department: 'Phòng Nhân sự', 
    bankAccount: '944147', bankName: 'Vietcombank', bankBranch: 'Chi nhánh 6', walletAddress: '0xA3D...7F1',
    email: 'bangna@example.com', address: '146 Phạm Văn Chiêu', mobile: '0963579744', landline: '(764) 749-6478', issueDate: '01/11/1986', issuePlace: 'Hải Phòng', status: 'active'
  },
  {
      id: '4', code: 'NV-00173', fullName: 'Nguyễn Thị Thanh Hồng', gender: 'Nữ', dob: '20/07/1995', cmnd: '023459348', position: 'Kiểm thử (QA)', department: 'Phòng Kỹ thuật (Tech)', 
      bankAccount: '0071000999', bankName: 'Techcombank', bankBranch: 'Bình Dương', walletAddress: '0xB4E...8G2',
      email: 'hongnt@example.com', address: 'Bình Dương', mobile: '0933444555', landline: '', issueDate: '10/02/2018', issuePlace: 'Bình Dương', status: 'active'
  },
  {
      id: '5', code: 'NV-00220', fullName: 'Trần Thái Cường', gender: 'Nam', dob: '05/11/1994', cmnd: '021189203', position: 'Lập trình viên', department: 'Phòng Kỹ thuật (Tech)', 
      bankAccount: '654321', bankName: 'ACB', bankBranch: 'Sài Gòn', walletAddress: '0xC5F...9H3',
      email: 'cuongtt@example.com', address: 'Q12, TP.HCM', mobile: '0977888999', landline: '', issueDate: '20/06/2016', issuePlace: 'HCM', status: 'active'
  }
];

const defaultForm: Omit<Employee, 'id'> = {
  code: '', fullName: '', gender: 'Nam', dob: '', cmnd: '', position: '', department: '', bankAccount: '', bankName: '', bankBranch: '',
  email: '', address: '', mobile: '', landline: '', issueDate: '', issuePlace: '', status: 'active', walletAddress: ''
};

export const EmployeeManagement: React.FC = () => {
  // --- STATE ---
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection State (Cho việc xóa nhiều)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultForm);

  // QR Modal
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrEmployee, setQrEmployee] = useState<Employee | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  // --- LOGIC ---
  
  // 1. Filter
  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  // 3. SELECTION LOGIC (CHECKBOX)
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Chọn tất cả ID trong trang hiện tại
      const allIds = currentItems.map(item => item.id);
      // Gộp với những cái đã chọn trước đó (nếu muốn giữ state qua các trang)
      // Hoặc chỉ chọn trang hiện tại:
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 4. DELETE LOGIC (SINGLE & BULK)
  const handleDeleteOne = (emp: Employee) => {
    if (window.confirm(`Bạn có chắc muốn xóa nhân viên <${emp.code} - ${emp.fullName}> không?`)) {
      setEmployees(prev => prev.filter(e => e.id !== emp.id));
      setSelectedIds(prev => prev.filter(id => id !== emp.id)); // Xóa khỏi danh sách chọn nếu có
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`HỆ THỐNG CẢNH BÁO:\n\nBạn đang yêu cầu XÓA ${selectedIds.length} nhân viên đã chọn.\nHành động này không thể hoàn tác.\n\nBạn có chắc chắn muốn tiếp tục?`)) {
      setEmployees(prev => prev.filter(e => !selectedIds.includes(e.id)));
      setSelectedIds([]); // Reset selection
    }
  };

  // 5. EXPORT LOGIC
  const handleExport = () => {
    // Header chuẩn theo yêu cầu
    const headers = [
      "Mã NV", "Tên nhân viên", "Giới tính", "Ngày sinh", "Số CMND", "Chức danh", 
      "Tên đơn vị", "Số tài khoản", "Tên ngân hàng", "Chi nhánh TK", 
      "Ví Blockchain (Smart Contract)", "Email", "Điện thoại" // Thêm cột ví
    ];

    // Data rows
    const rows = filteredEmployees.map(e => [
      e.code, e.fullName, e.gender, e.dob, `"${e.cmnd}"`, e.position, 
      e.department, `"${e.bankAccount}"`, e.bankName, e.bankBranch,
      e.walletAddress, e.email, `"${e.mobile}"`
    ]);

    // Combine with BOM for Excel Vietnamese support
    const csvContent = [
      headers.join(","), 
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Danh_sach_nhan_vien_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 6. Form Handlers
  const handleOpenModal = (employee: Employee | null) => {
    if (employee) {
      setEditingId(employee.id);
      setFormData(employee);
    } else {
      setEditingId(null);
      setFormData({ ...defaultForm, code: `NV-${Math.floor(Math.random()*10000)}`, department: MOCK_DEPARTMENTS[0] });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setEmployees(prev => prev.map(emp => emp.id === editingId ? { ...formData, id: editingId } : emp));
    } else {
      setEmployees(prev => [...prev, { ...formData, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
  };

  // --- RENDER ---
  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans text-sm">
      
      {/* 1. HEADER (DANH SÁCH NHÂN VIÊN) */}
      <div className="bg-white px-5 py-4 flex justify-between items-center shadow-sm border-b border-gray-200">
        <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-800 uppercase tracking-tight">DANH SÁCH NHÂN VIÊN</h1>
            <p className="text-xs text-gray-500 mt-0.5">Quản lý hồ sơ nhân sự & Ví Blockchain</p>
        </div>
        
        <div className="flex items-center gap-3">
             {/* THANH TÌM KIẾM */}
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Tìm theo mã, tên..." 
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded text-sm w-72 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            </div>

            {/* NÚT XÓA NHIỀU (CHỈ HIỆN KHI CÓ CHỌN) */}
            {selectedIds.length > 0 && (
                 <button 
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-1 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded font-bold hover:bg-red-100 transition-colors animate-in fade-in"
                >
                    <Trash2 className="w-4 h-4" /> Xóa ({selectedIds.length})
                </button>
            )}
            
            <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
                <FileSpreadsheet className="w-4 h-4 text-green-600" /> Xuất file 
            </button>
            
            {/* NÚT THÊM MỚI (MÀU XANH LÁ CHUẨN MISA/ERP) */}
            <button 
                onClick={() => handleOpenModal(null)}
                className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 transition-all flex items-center gap-2 shadow-sm font-medium"
            >
                <Plus className="w-5 h-5" /> Thêm mới nhân viên
            </button>
        </div>
      </div>

      {/* 2. TABLE AREA */}
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
                        <th className="p-3 border-r border-gray-200 min-w-[100px]">Mã NV</th>
                        <th className="p-3 border-r border-gray-200 min-w-[180px]">Tên nhân viên</th>
                        <th className="p-3 border-r border-gray-200 min-w-[80px]">Giới tính</th>
                        <th className="p-3 border-r border-gray-200 min-w-[100px]">Ngày sinh</th>
                        <th className="p-3 border-r border-gray-200 min-w-[120px]">Số CMND</th>
                        <th className="p-3 border-r border-gray-200 min-w-[150px]">Chức danh</th>
                        <th className="p-3 border-r border-gray-200 min-w-[180px]">Tên đơn vị</th>
                        <th className="p-3 border-r border-gray-200 min-w-[120px]">Số tài khoản</th>
                        <th className="p-3 border-r border-gray-200 min-w-[150px]">Tên ngân hàng</th>
                        <th className="p-3 border-r border-gray-200 min-w-[150px] text-blue-700 bg-blue-50/50">Ví Blockchain</th>
                        <th className="p-3 border-b border-gray-200 text-center min-w-[110px] sticky right-0 bg-gray-100 shadow-l">CHỨC NĂNG</th>
                    </tr>
                </thead>
                <tbody className="text-gray-800 text-sm">
                    {currentItems.map((emp) => (
                        <tr key={emp.id} className={`hover:bg-blue-50 transition-colors border-b border-gray-100 group ${selectedIds.includes(emp.id) ? 'bg-green-50' : ''}`}>
                            <td className="p-2 border-r border-gray-100 text-center">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded text-green-600 focus:ring-green-500 cursor-pointer"
                                    checked={selectedIds.includes(emp.id)}
                                    onChange={() => handleSelectOne(emp.id)}
                                />
                            </td>
                            <td className="p-2 border-r border-gray-100">{emp.code}</td>
                            <td className="p-2 border-r border-gray-100 font-medium text-blue-700 cursor-pointer hover:underline" onClick={() => handleOpenModal(emp)}>
                                {emp.fullName}
                            </td>
                            <td className="p-2 border-r border-gray-100">{emp.gender}</td>
                            <td className="p-2 border-r border-gray-100">{emp.dob}</td>
                            <td className="p-2 border-r border-gray-100">{emp.cmnd}</td>
                            <td className="p-2 border-r border-gray-100">{emp.position}</td>
                            <td className="p-2 border-r border-gray-100">{emp.department}</td>
                            <td className="p-2 border-r border-gray-100">{emp.bankAccount}</td>
                            <td className="p-2 border-r border-gray-100">{emp.bankName}</td>
                            <td className="p-2 border-r border-gray-100 font-mono text-xs text-blue-600 truncate max-w-[120px]" title={emp.walletAddress}>
                                {emp.walletAddress}
                            </td>
                            
                            {/* CỘT CHỨC NĂNG (THEO YÊU CẦU: SỬA - QR - XÓA) */}
                            <td className="p-2 text-center sticky right-0 bg-white group-hover:bg-blue-50 shadow-l border-l border-gray-100">
                                <div className="flex items-center justify-center gap-3">
                                    <span 
                                        className="text-blue-600 font-bold text-xs cursor-pointer hover:underline uppercase"
                                        onClick={() => handleOpenModal(emp)}
                                    >
                                        Sửa
                                    </span>
                                    <button onClick={() => {setQrEmployee(emp); setQrModalOpen(true)}} className="text-gray-500 hover:text-black transition-colors" title="Mã QR">
                                        <QrCode size={15}/>
                                    </button>
                                    <button onClick={() => handleDeleteOne(emp)} className="text-gray-400 hover:text-red-600 transition-colors" title="Xóa nhân viên này">
                                        <Trash2 size={15}/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {/* HÀNG TRỐNG ĐỂ GIỮ KHUNG */}
                    {Array.from({length: Math.max(0, 10 - currentItems.length)}).map((_, i) => (
                        <tr key={`empty-${i}`}><td colSpan={13} className="p-4 border-b border-gray-50">&nbsp;</td></tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* 3. PAGINATION */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center text-xs text-gray-600">
        <div>
            Tổng số: <span className="font-bold text-gray-900">{filteredEmployees.length}</span> bản ghi | Đang chọn: <span className="font-bold text-green-600">{selectedIds.length}</span>
        </div>
        <div className="flex items-center gap-4">
            <select 
                value={itemsPerPage} 
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 outline-none focus:border-green-600"
            >
                <option value={10}>10 bản ghi/trang</option>
                <option value={20}>20 bản ghi/trang</option>
                <option value={50}>50 bản ghi/trang</option>
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

      {/* --- MODAL FORM (CHI TIẾT NHƯ HÌNH MẪU) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Thông tin nhân viên
              </h3>
              <div className="flex gap-4 items-center">
                 <div className="flex gap-4 text-sm text-gray-600">
                    <label className="flex items-center gap-1 cursor-pointer select-none"><input type="checkbox" className="rounded text-green-600 focus:ring-green-500"/> Là khách hàng</label>
                    <label className="flex items-center gap-1 cursor-pointer select-none"><input type="checkbox" className="rounded text-green-600 focus:ring-green-500"/> Là nhà cung cấp</label>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24}/></button>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-white">
              <form id="empForm" onSubmit={handleSubmit} className="space-y-5">
                {/* HÀNG 1 */}
                <div className="grid grid-cols-12 gap-4">
                   <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Mã <span className="text-red-500">*</span></label>
                      <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-3 h-8 border border-gray-300 rounded-sm text-sm focus:border-green-600 outline-none focus:ring-1 focus:ring-green-600" />
                   </div>
                   <div className="col-span-4">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Tên <span className="text-red-500">*</span></label>
                      <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-3 h-8 border border-gray-300 rounded-sm text-sm focus:border-green-600 outline-none focus:ring-1 focus:ring-green-600" />
                   </div>
                   <div className="col-span-3">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Ngày sinh</label>
                      <input type="text" placeholder="dd/mm/yyyy" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full px-3 h-8 border border-gray-300 rounded-sm text-sm focus:border-green-600 outline-none" />
                   </div>
                   <div className="col-span-3">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Giới tính</label>
                      <div className="flex items-center gap-4 h-8 px-1">
                         {['Nam', 'Nữ', 'Khác'].map(g => (
                            <label key={g} className="flex items-center gap-1 text-sm cursor-pointer">
                               <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={e => setFormData({...formData, gender: e.target.value as any})} className="text-green-600 focus:ring-green-500"/> {g}
                            </label>
                         ))}
                      </div>
                   </div>
                </div>

                {/* HÀNG 2 */}
                <div className="grid grid-cols-12 gap-4">
                   <div className="col-span-6">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Đơn vị <span className="text-red-500">*</span></label>
                      <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 h-8 border border-gray-300 rounded-sm text-sm bg-white focus:border-green-600 outline-none">
                         {MOCK_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                   </div>
                   <div className="col-span-3">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Số CMND</label>
                      <input type="text" value={formData.cmnd} onChange={e => setFormData({...formData, cmnd: e.target.value})} className="w-full px-3 h-8 border border-gray-300 rounded-sm text-sm focus:border-green-600 outline-none" />
                   </div>
                   <div className="col-span-3">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Ngày cấp</label>
                      <input type="text" placeholder="dd/mm/yyyy" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} className="w-full px-3 h-8 border border-gray-300 rounded-sm text-sm focus:border-green-600 outline-none" />
                   </div>
                </div>

                {/* HÀNG 3 */}
                <div className="grid grid-cols-12 gap-4">
                   <div className="col-span-6">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Chức danh</label>
                      <input type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full px-3 h-8 border border-gray-300 rounded-sm text-sm focus:border-green-600 outline-none" />
                   </div>
                   <div className="col-span-6">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Nơi cấp</label>
                      <input type="text" value={formData.issuePlace} onChange={e => setFormData({...formData, issuePlace: e.target.value})} className="w-full px-3 h-8 border border-gray-300 rounded-sm text-sm focus:border-green-600 outline-none" />
                   </div>
                </div>

                {/* HÀNG 4 */}
                <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1">Địa chỉ</label>
                   <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 h-8 border border-gray-300 rounded-sm text-sm focus:border-green-600 outline-none" />
                </div>

                {/* HÀNG 5 */}
                <div className="grid grid-cols-12 gap-4">
                   <div className="col-span-4">
                      <label className="block text-xs font-bold text-gray-700 mb-1">ĐT di động</label>
                      <input type="text" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full px-3 h-8 border border-gray-300 rounded-sm text-sm focus:border-green-600 outline-none" />
                   </div>
                   <div className="col-span-4">
                      <label className="block text-xs font-bold text-gray-700 mb-1">ĐT cố định</label>
                      <input type="text" value={formData.landline} onChange={e => setFormData({...formData, landline: e.target.value})} className="w-full px-3 h-8 border border-gray-300 rounded-sm text-sm focus:border-green-600 outline-none" />
                   </div>
                   <div className="col-span-4">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 h-8 border border-gray-300 rounded-sm text-sm focus:border-green-600 outline-none" />
                   </div>
                </div>

                {/* HÀNG 6 - NGÂN HÀNG & VÍ BLOCKCHAIN */}
                <div className="grid grid-cols-12 gap-4">
                   <div className="col-span-3">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Tài khoản ngân hàng</label>
                      <input type="text" value={formData.bankAccount} onChange={e => setFormData({...formData, bankAccount: e.target.value})} className="w-full px-3 h-8 border border-gray-300 rounded-sm text-sm focus:border-green-600 outline-none" />
                   </div>
                   <div className="col-span-3">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Tên ngân hàng</label>
                      <input type="text" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full px-3 h-8 border border-gray-300 rounded-sm text-sm focus:border-green-600 outline-none" />
                   </div>
                   <div className="col-span-3">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Chi nhánh</label>
                      <input type="text" value={formData.bankBranch} onChange={e => setFormData({...formData, bankBranch: e.target.value})} className="w-full px-3 h-8 border border-gray-300 rounded-sm text-sm focus:border-green-600 outline-none" />
                   </div>
                   {/* Ví Blockchain */}
                   <div className="col-span-3">
                      <label className="block text-xs font-bold text-blue-800 mb-1 flex items-center gap-1">
                        <Wallet size={12}/> Ví Blockchain
                      </label>
                      <input type="text" value={formData.walletAddress} onChange={e => setFormData({...formData, walletAddress: e.target.value})} placeholder="0x..." className="w-full px-3 h-8 border border-blue-200 rounded-sm text-sm font-mono text-blue-700 focus:border-blue-500 outline-none" />
                   </div>
                </div>

              </form>
            </div>

            {/* Footer Modal Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
               <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-400 text-gray-700 rounded-sm text-sm font-medium hover:bg-gray-100 min-w-[80px]">Hủy</button>
               <div className="flex gap-2">
                   {/* <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-400 text-gray-700 rounded-sm text-sm font-medium hover:bg-gray-100 min-w-[80px]">Cắt</button> */}
                   <button 
                     onClick={() => document.getElementById('empForm')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
                     className="px-4 py-2 bg-green-600 text-white rounded-sm text-sm font-bold hover:bg-green-700 shadow-sm min-w-[100px]"
                   >
                     Lưu lại
                   </button>
               </div>
            </div>

          </div>
        </div>
      )}

      {/* QR MODAL */}
      {qrModalOpen && qrEmployee && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
           <div className="bg-white rounded-lg shadow-xl p-6 text-center max-w-sm w-full relative animate-in zoom-in duration-200">
              <button onClick={() => setQrModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
              <h3 className="font-bold text-lg mb-4 text-gray-800">Mã QR Định Danh</h3>
              <div className="flex justify-center mb-4 p-2 border rounded" ref={qrRef}>
                 <QRCodeCanvas value={qrEmployee.code} size={180} />
              </div>
              <p className="font-bold text-lg text-green-700">{qrEmployee.fullName}</p>
              <p className="text-sm text-gray-500 font-mono mb-4">{qrEmployee.code}</p>
              
              <div className="text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded border border-gray-100">
                 Ví Blockchain: <span className="font-mono text-blue-600">{qrEmployee.walletAddress || 'Chưa liên kết'}</span>
              </div>

              <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex justify-center items-center gap-2 font-medium">
                  <Download size={16}/> Tải xuống QR
              </button>
           </div>
        </div>
      )}
    </div>
  );
};