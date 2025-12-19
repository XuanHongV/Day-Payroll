import React, { useState, FormEvent } from 'react';
import { 
  Plus, Clock, Trash2, Edit, Save, X, CheckSquare, 
  Settings, Info, AlertCircle 
} from 'lucide-react';

// --- 1. DATA TYPES & MOCK DATA ---
interface Shift {
  id: string;
  code: string;       // Mã ca
  name: string;       // Tên ca
  department: string; // Đơn vị áp dụng
  startTime: string;  // Giờ bắt đầu
  endTime: string;    // Giờ kết thúc
  breakStart?: string;// Nghỉ trưa từ
  breakEnd?: string;  // Nghỉ trưa đến
  workHours: number;  // Số công
  coefficient: number;// Hệ số lương
  color: string;      // Màu hiển thị
  
  // -- Cấu hình nâng cao --
  allowLateEarly: boolean; // Đi muộn về sớm
  lateMinutes: number;
  earlyMinutes: number;
  isOvertime: boolean;     // Có tính làm thêm
  otTypes: string[];       // ['before', 'after', 'break']
  hasMealAllowance: boolean; // Công ăn ca
}

const MOCK_SHIFTS: Shift[] = [
  { 
    id: '1', code: 'HC', name: 'Hành chính', department: 'Tất cả', 
    startTime: '08:00', endTime: '17:30', breakStart: '12:00', breakEnd: '13:30', 
    workHours: 8, coefficient: 1.0, color: '#3b82f6',
    allowLateEarly: true, lateMinutes: 15, earlyMinutes: 15, isOvertime: false, otTypes: [], hasMealAllowance: true
  },
  { 
    id: '2', code: 'CA_SANG', name: 'Ca Sáng', department: 'Sản xuất', 
    startTime: '06:00', endTime: '14:00', 
    workHours: 8, coefficient: 1.0, color: '#10b981',
    allowLateEarly: false, lateMinutes: 0, earlyMinutes: 0, isOvertime: true, otTypes: ['after'], hasMealAllowance: true
  },
  { 
    id: '3', code: 'CA_DEM', name: 'Ca Đêm', department: 'Bảo vệ', 
    startTime: '22:00', endTime: '06:00', 
    workHours: 8, coefficient: 1.5, color: '#6366f1',
    allowLateEarly: false, lateMinutes: 0, earlyMinutes: 0, isOvertime: true, otTypes: ['before', 'after'], hasMealAllowance: true
  },
];

const MOCK_DEPARTMENTS = ['Tất cả đơn vị', 'Phòng Kỹ thuật', 'Phòng Nhân sự', 'Sản xuất', 'Bảo vệ'];

const defaultForm: Omit<Shift, 'id'> = {
  code: '', name: '', department: 'Tất cả đơn vị', 
  startTime: '08:00', endTime: '17:30', breakStart: '', breakEnd: '', 
  workHours: 8, coefficient: 1.0, color: '#3b82f6',
  allowLateEarly: true, lateMinutes: 10, earlyMinutes: 10,
  isOvertime: false, otTypes: [], hasMealAllowance: false
};

export const ShiftManagement: React.FC = () => {
  // --- STATE ---
  const [shifts, setShifts] = useState<Shift[]>(MOCK_SHIFTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultForm);
  
  // State UI
  const [activeTab, setActiveTab] = useState<'general' | 'advanced'>('general');
  const [hasBreak, setHasBreak] = useState(false);

  // --- LOGIC ---
  const calculateWorkHours = (start: string, end: string, bStart?: string, bEnd?: string) => {
    if (!start || !end) return 0;
    const toMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };
    let totalMins = toMinutes(end) - toMinutes(start);
    if (totalMins < 0) totalMins += 24 * 60; 
    if (hasBreak && bStart && bEnd) {
      let breakMins = toMinutes(bEnd) - toMinutes(bStart);
      if (breakMins < 0) breakMins += 24 * 60;
      totalMins -= breakMins;
    }
    return parseFloat((totalMins / 60).toFixed(1));
  };

  const handleOpenModal = (shift: Shift | null) => {
    setActiveTab('general');
    if (shift) {
      setEditingId(shift.id);
      setFormData(shift);
      setHasBreak(!!shift.breakStart);
    } else {
      setEditingId(null);
      setFormData(defaultForm);
      setHasBreak(false);
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa ca làm việc này?")) {
      setShifts(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };
    
    // Tự động tính công
    if (['startTime', 'endTime', 'breakStart', 'breakEnd'].includes(name)) {
       const wh = calculateWorkHours(
         newFormData.startTime, newFormData.endTime, 
         hasBreak ? newFormData.breakStart : undefined, 
         hasBreak ? newFormData.breakEnd : undefined
       );
       newFormData.workHours = wh;
    }
    setFormData(newFormData);
  };

  const handleOtChange = (type: string) => {
    const currentTypes = formData.otTypes;
    if (currentTypes.includes(type)) {
      setFormData({ ...formData, otTypes: currentTypes.filter(t => t !== type) });
    } else {
      setFormData({ ...formData, otTypes: [...currentTypes, type] });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const finalData = { 
        ...formData, 
        breakStart: hasBreak ? formData.breakStart : undefined,
        breakEnd: hasBreak ? formData.breakEnd : undefined
    };

    if (editingId) {
      setShifts(prev => prev.map(s => s.id === editingId ? { ...finalData, id: editingId } : s));
    } else {
      setShifts(prev => [...prev, { ...finalData, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
  };

  // --- RENDER ---
  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-sm">
      
      {/* HEADER */}
      <div className="bg-white px-6 py-4 flex justify-between items-center shadow-sm border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900 uppercase">Cấu hình Ca làm việc</h2>
          <p className="text-xs text-gray-500 mt-1">Thiết lập thời gian làm việc & hệ số lương</p>
        </div>
        <button
          onClick={() => handleOpenModal(null)}
          className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 transition-all flex items-center gap-2 shadow-sm font-medium"
        >
          <Plus size={18} /> Thêm mới
        </button>
      </div>

      {/* GRID CA LÀM VIỆC (GIỮ NGUYÊN THEO YÊU CẦU CỦA BẠN) */}
      <div className="p-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {shifts.map((shift) => (
            <div key={shift.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all group overflow-hidden">
              {/* Card Header: Color Strip & Info */}
              <div className="h-1.5 w-full" style={{ backgroundColor: shift.color }}></div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{shift.name}</h3>
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{shift.code}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(shift)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(shift.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                </div>

                {/* Time Info */}
                <div className="flex items-center gap-2 mb-4 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <Clock size={18} className="text-blue-600" />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm font-semibold text-gray-800">
                      <span>{shift.startTime}</span>
                      <span>→</span>
                      <span>{shift.endTime}</span>
                    </div>
                    {shift.breakStart && (
                      <p className="text-xs text-gray-500 mt-1">Nghỉ: {shift.breakStart} - {shift.breakEnd}</p>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-dashed border-gray-100 pb-2">
                    <span className="text-gray-500">Số công:</span>
                    <span className="font-bold text-gray-900">{shift.workHours} giờ</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-gray-100 pb-2">
                    <span className="text-gray-500">Hệ số lương:</span>
                    <span className="font-bold text-green-600">x {shift.coefficient}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-gray-500">Áp dụng:</span>
                    <span className="text-gray-900 truncate max-w-[120px]">{shift.department}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL ADD/EDIT (NÂNG CẤP VỚI TABS) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4 z-50 animate-in zoom-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'Cập nhật Ca làm việc' : 'Thêm mới ca làm việc'}
              </h3>
              <div className="flex gap-3">
                 <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-sm font-medium transition-colors">Hủy</button>
                 <button onClick={handleSubmit} className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-bold shadow-sm transition-colors">Lưu</button>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 px-6">
                <button 
                    onClick={() => setActiveTab('general')}
                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general' ? 'border-orange-600 text-orange-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Chung
                </button>
                <button 
                    onClick={() => setActiveTab('advanced')}
                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'advanced' ? 'border-orange-600 text-orange-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Thiết lập nâng cao
                </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto bg-white flex-1">
               
               {/* TAB 1: THÔNG TIN CHUNG */}
               {activeTab === 'general' && (
                   <div className="space-y-6">
                      <div className="grid grid-cols-12 gap-6">
                         <div className="col-span-8">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên ca <span className="text-red-500">*</span></label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 h-10 border border-gray-300 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none" autoFocus />
                         </div>
                         <div className="col-span-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mã ca <span className="text-red-500">*</span></label>
                            <input type="text" name="code" value={formData.code} onChange={handleChange} className="w-full px-3 h-10 border border-gray-300 rounded focus:border-orange-500 outline-none" />
                         </div>
                      </div>

                      <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị áp dụng</label>
                         <select name="department" value={formData.department} onChange={handleChange} className="w-full px-3 h-10 border border-gray-300 rounded bg-white focus:border-orange-500 outline-none">
                            {MOCK_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                         </select>
                      </div>

                      <div className="bg-gray-50 p-5 rounded border border-gray-200">
                         <div className="flex items-center gap-10 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Giờ bắt đầu</label>
                                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="px-3 h-10 border border-gray-300 rounded focus:border-blue-500 outline-none w-40" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Giờ kết thúc</label>
                                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="px-3 h-10 border border-gray-300 rounded focus:border-blue-500 outline-none w-40" />
                            </div>
                         </div>
                         
                         <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-800 mb-3">
                           <input type="checkbox" checked={hasBreak} onChange={e => setHasBreak(e.target.checked)} className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500" />
                           Có nghỉ giữa ca
                         </label>

                         {hasBreak && (
                           <div className="flex items-center gap-10 animate-in fade-in slide-in-from-top-1">
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 mb-1">Nghỉ từ</label>
                                  <input type="time" name="breakStart" value={formData.breakStart} onChange={handleChange} className="px-3 h-9 border border-gray-300 rounded focus:border-blue-500 outline-none w-40 bg-white" />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 mb-1">Đến</label>
                                  <input type="time" name="breakEnd" value={formData.breakEnd} onChange={handleChange} className="px-3 h-9 border border-gray-300 rounded focus:border-blue-500 outline-none w-40 bg-white" />
                              </div>
                           </div>
                         )}
                      </div>

                      <div className="grid grid-cols-3 gap-6 pt-2">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Số giờ công (tự động)</label>
                           <input type="number" value={formData.workHours} readOnly className="w-full px-3 h-10 border border-gray-200 bg-gray-100 rounded text-gray-600 font-bold" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Hệ số lương</label>
                           <input type="number" name="coefficient" value={formData.coefficient} onChange={handleChange} step="0.1" className="w-full px-3 h-10 border border-gray-300 rounded focus:border-orange-500 outline-none font-bold text-green-700" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Màu hiển thị</label>
                           <div className="flex gap-2">
                              {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'].map(c => (
                                 <div 
                                    key={c} onClick={() => setFormData({...formData, color: c})}
                                    className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-all ${formData.color === c ? 'border-gray-600 scale-110 shadow-md' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                 ></div>
                              ))}
                           </div>
                        </div>
                     </div>
                   </div>
               )}

               {/* TAB 2: THIẾT LẬP NÂNG CAO (GIỐNG HÌNH MẪU) */}
               {activeTab === 'advanced' && (
                   <div className="space-y-0 divide-y divide-gray-100">
                        {/* Section 1: Đi muộn về sớm */}
                        <div className="py-4">
                            <div className="flex items-center gap-4 mb-3">
                                <span className="text-sm font-bold text-gray-800 w-40 flex items-center gap-2"><Clock size={14}/> Đi muộn về sớm</span>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                                        <input type="radio" name="allowLateEarly" checked={formData.allowLateEarly} onChange={() => setFormData({...formData, allowLateEarly: true})} className="text-orange-600 focus:ring-orange-500"/> Có
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                                        <input type="radio" name="allowLateEarly" checked={!formData.allowLateEarly} onChange={() => setFormData({...formData, allowLateEarly: false})} className="text-orange-600 focus:ring-orange-500"/> Không
                                    </label>
                                </div>
                            </div>
                            {formData.allowLateEarly && (
                                <div className="ml-40 flex flex-col gap-3 animate-in fade-in">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 w-32">Cho phép đi muộn</span>
                                        <input type="number" value={formData.lateMinutes} onChange={e => setFormData({...formData, lateMinutes: parseInt(e.target.value)})} className="w-16 h-8 px-2 border border-gray-300 rounded text-center text-sm"/>
                                        <span className="text-sm text-gray-500">Phút</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 w-32">Cho phép về sớm</span>
                                        <input type="number" value={formData.earlyMinutes} onChange={e => setFormData({...formData, earlyMinutes: parseInt(e.target.value)})} className="w-16 h-8 px-2 border border-gray-300 rounded text-center text-sm"/>
                                        <span className="text-sm text-gray-500">Phút</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 2: Làm thêm giờ */}
                        <div className="py-4">
                            <div className="flex items-center gap-4 mb-3">
                                <span className="text-sm font-bold text-gray-800 w-40 flex items-center gap-2"><Plus size={14}/> Làm thêm giờ</span>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                                        <input type="radio" name="isOvertime" checked={formData.isOvertime} onChange={() => setFormData({...formData, isOvertime: true})} className="text-orange-600 focus:ring-orange-500"/> Có
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                                        <input type="radio" name="isOvertime" checked={!formData.isOvertime} onChange={() => setFormData({...formData, isOvertime: false})} className="text-orange-600 focus:ring-orange-500"/> Không
                                    </label>
                                </div>
                            </div>
                            {formData.isOvertime && (
                                <div className="ml-40 flex gap-6 animate-in fade-in">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                                        <input type="checkbox" checked={formData.otTypes.includes('before')} onChange={() => handleOtChange('before')} className="rounded text-orange-600"/> Trước ca
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                                        <input type="checkbox" checked={formData.otTypes.includes('after')} onChange={() => handleOtChange('after')} className="rounded text-orange-600"/> Sau ca
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                                        <input type="checkbox" checked={formData.otTypes.includes('break')} onChange={() => handleOtChange('break')} className="rounded text-orange-600"/> Nghỉ giữa ca
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Section 3: Công ăn ca */}
                        <div className="py-4">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-gray-800 w-40 flex items-center gap-2"><Info size={14}/> Công ăn ca</span>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                                        <input type="radio" name="hasMealAllowance" checked={formData.hasMealAllowance} onChange={() => setFormData({...formData, hasMealAllowance: true})} className="text-orange-600 focus:ring-orange-500"/> Có
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                                        <input type="radio" name="hasMealAllowance" checked={!formData.hasMealAllowance} onChange={() => setFormData({...formData, hasMealAllowance: false})} className="text-orange-600 focus:ring-orange-500"/> Không
                                    </label>
                                </div>
                            </div>
                        </div>
                   </div>
               )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};