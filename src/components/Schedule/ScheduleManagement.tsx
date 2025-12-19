import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, 
  Loader2, Briefcase, Search, Filter, Settings, Trash2, Edit, List, Grid, Info 
} from 'lucide-react';
import api from '../../services/apiService';
import { Employee, Shift } from '../../types';

// --- 1. MOCK DATA & TYPES CHO DANH SÁCH TỔNG QUAN (GIỐNG HÌNH) ---
interface SchedulePlan {
  id: string;
  name: string;           // Tên bảng phân ca
  duration: string;       // Thời gian áp dụng
  shiftName: string;      // Ca làm việc
  department: string;     // Đơn vị áp dụng
  appliedTo: string;      // Đối tượng áp dụng
}

const MOCK_SCHEDULE_PLANS: SchedulePlan[] = [
  { id: '1', name: 'B0554 - Phân ca Tháng 12', duration: '01/12/2025 - 31/12/2025', shiftName: 'Ca đêm VAS', department: 'CÔNG TY DỊCH VỤ SỬA CHỮA ĐIỆN', appliedTo: 'Đỗ Lan Anh' },
  { id: '2', name: 'Ca TTTV', duration: '01/11/2025 - 30/11/2025', shiftName: 'Phân ca toàn bộ NV', department: 'TRUNG TÂM DỊCH VỤ KHÁCH HÀNG', appliedTo: 'Toàn bộ nhân viên' },
  { id: '3', name: 'Ca làm bù', duration: '04/12/2025 - 05/12/2025', shiftName: 'Ca tiết 1, Tiết 2', department: 'Văn phòng Hà Nội 1', appliedTo: 'Nguyễn Văn A' },
  { id: '4', name: 'Apero', duration: '01/04/2025 - 13/04/2025', shiftName: 'Apero 1', department: 'Văn phòng Hà Nội 1', appliedTo: 'Hà Thu Phương, Lê Uyển Nhi' },
  { id: '5', name: 'Phân ca HC Phòng Hành Chính', duration: '01/01/2025 - 31/12/2025', shiftName: 'Ca HC', department: 'Phòng Tài chính', appliedTo: 'Phòng Tài chính' },
  { id: '6', name: 'Ca HC T7', duration: '01/04/2025 - 30/04/2025', shiftName: 'SÁNG THỨ 7', department: 'Sản xuất - Phân xưởng 1', appliedTo: 'Tổ trưởng' },
  { id: '7', name: 'CA HC', duration: '01/04/2025 - 30/04/2025', shiftName: 'Ca hành chính thứ 2 đến thứ 6', department: 'Khối Văn Phòng', appliedTo: 'Toàn bộ nhân viên' },
  { id: '8', name: 'bang01-03 (từ thứ 2 đến sáng thứ 7)', duration: '13/03/2025 - 31/03/2025', shiftName: 'SÁNG THỨ 7, Ca hành chính', department: 'CÔNG TY DỊCH VỤ SỬA CHỮA ĐIỆN', appliedTo: 'Bùi Anh Tú' },
  { id: '9', name: 'Bảng ca 1', duration: '23/02/2025 - 23/02/2025', shiftName: 'Phân ca toàn bộ nhân viên', department: 'Phòng Kỹ thuật', appliedTo: 'Nguyễn Văn Liệt' },
  { id: '10', name: 'Phân ca tháng 8', duration: '01/07/2025 - 30/09/2025', shiftName: 'Phân ca toàn bộ nhân viên', department: 'CÔNG TY DỊCH VỤ SỬA CHỮA ĐIỆN', appliedTo: 'Toàn bộ nhân viên' },
];

// --- 2. TYPES CHO MATRIX VIEW (CODE CŨ CỦA BẠN) ---
interface ShiftAssignment {
  _id: string;
  user: string;
  shift: { _id: string; name: string; start_time: string; end_time: string; color_code?: string; };
  date: string;
}

export const ScheduleManagement = () => {
  // --- STATE CHUNG ---
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list'); // Chế độ xem: Danh sách (List) hoặc Lưới (Matrix)
  
  // --- STATE LIST VIEW ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);

  // --- STATE MATRIX VIEW ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [loading, setLoading] = useState(false); // Tắt loading mặc định để hiện mock data
  const [selectedCell, setSelectedCell] = useState<{ userId: string, date: string, userName: string } | null>(null);

  // --- LOGIC LIST VIEW ---
  const filteredPlans = MOCK_SCHEDULE_PLANS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.checked) setSelectedPlanIds(filteredPlans.map(p => p.id));
    else setSelectedPlanIds([]);
  };

  // --- LOGIC MATRIX VIEW (GIỮ NGUYÊN) ---
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  const weekStart = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, shiftsRes, assignRes] = await Promise.all([
        api.get('/users'),
        api.get('/shifts'),
        api.get(`/shift-assignments?start=${formatDateKey(weekDays[0])}&end=${formatDateKey(weekDays[6])}`)
      ]);
      setEmployees(usersRes.data.filter((u: any) => u.role === 'STAFF').map((u: any) => ({ ...u, id: u._id || u.id })));
      setShifts(shiftsRes.data.map((s: any) => ({ id: s._id || s.id, name: s.name, startTime: s.start_time, endTime: s.end_time, color_code: s.color_code || '#3b82f6' })));
      setAssignments(assignRes.data);
    } catch (error) { console.error("Lỗi tải dữ liệu:", error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { if(viewMode === 'matrix') fetchData(); }, [currentDate, viewMode]);

  const handleAssignShift = async (shiftId: string) => {
    if (!selectedCell) return;
    try {
      await api.post('/shift-assignments', { userId: selectedCell.userId, shiftId: shiftId, work_date: selectedCell.date });
      fetchData(); setSelectedCell(null);
    } catch (error: any) { alert("Lỗi phân ca"); }
  };

  const changeWeek = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (offset * 7));
    setCurrentDate(newDate);
  };

  // --- RENDER ---
  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-sm">
      
      {/* 1. TOP NAVIGATION & TABS */}
      <div className="bg-white px-5 py-3 border-b border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h1 className="text-xl font-bold text-gray-800 uppercase tracking-tight">PHÂN CA CHI TIẾT</h1>
           <p className="text-xs text-gray-500 mt-0.5">Quản lý lịch làm việc & Phân công</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <List size={16} className="mr-2"/> Danh sách bảng phân ca
            </button>
            <button 
                onClick={() => setViewMode('matrix')}
                className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'matrix' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <Grid size={16} className="mr-2"/> Lịch phân ca chi tiết
            </button>
        </div>
      </div>

      {/* 2. VIEW CONTENT */}
      <div className="flex-1 overflow-auto p-4">
        
        {/* === VIEW 1: DANH SÁCH (GIỐNG HÌNH ẢNH) === */}
        {viewMode === 'list' && (
            <div className="bg-white border border-gray-300 shadow-sm rounded-sm flex flex-col h-full">
                {/* Toolbar */}
                <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <input 
                                type="text" placeholder="Tìm kiếm..." 
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm w-64 focus:border-orange-500 outline-none"
                            />
                            <Search className="absolute left-2.5 top-2 text-gray-400 w-4 h-4"/>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <select className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white outline-none">
                            <option>Tất cả đơn vị</option>
                            <option>Phòng Kỹ thuật</option>
                        </select>
                        <button className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50"><Filter size={16}/></button>
                        <button className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50"><Settings size={16}/></button>
                        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1.5 rounded font-medium flex items-center gap-1 shadow-sm transition-colors">
                            <Plus size={16}/> Thêm
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 text-gray-700 font-bold text-xs sticky top-0 z-10">
                            <tr>
                                <th className="p-3 border-b border-r border-gray-200 w-10 text-center">
                                    <input type="checkbox" onChange={handleSelectAll} className="rounded text-orange-600 focus:ring-orange-500"/>
                                </th>
                                <th className="p-3 border-b border-r border-gray-200 min-w-[200px]">Tên Bảng phân ca</th>
                                <th className="p-3 border-b border-r border-gray-200 min-w-[180px]">Thời gian áp dụng</th>
                                <th className="p-3 border-b border-r border-gray-200 min-w-[150px]">Ca làm việc</th>
                                <th className="p-3 border-b border-r border-gray-200 min-w-[250px]">Đơn vị áp dụng</th>
                                <th className="p-3 border-b border-r border-gray-200 min-w-[200px]">Đối tượng áp dụng</th>
                                <th className="p-3 border-b border-gray-200 w-20 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-800 text-sm">
                            {filteredPlans.map((plan, idx) => (
                                <tr key={plan.id} className="hover:bg-orange-50 transition-colors border-b border-gray-100 group">
                                    <td className="p-3 border-r border-gray-100 text-center">
                                        <input type="checkbox" checked={selectedPlanIds.includes(plan.id)} onChange={() => {}} className="rounded text-orange-600 focus:ring-orange-500"/>
                                    </td>
                                    <td className="p-3 border-r border-gray-100 font-medium text-gray-900">{plan.name}</td>
                                    <td className="p-3 border-r border-gray-100 text-gray-600">{plan.duration}</td>
                                    <td className="p-3 border-r border-gray-100">{plan.shiftName}</td>
                                    <td className="p-3 border-r border-gray-100 text-gray-500 text-xs uppercase font-semibold">{plan.department}</td>
                                    <td className="p-3 border-r border-gray-100 text-gray-700">{plan.appliedTo}</td>
                                    <td className="p-2 text-center sticky right-0 bg-white group-hover:bg-orange-50">
                                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-blue-600 hover:bg-blue-100 p-1 rounded" title="Sửa"><Edit size={14}/></button>
                                            <button className="text-red-600 hover:bg-red-100 p-1 rounded" title="Xóa"><Trash2 size={14}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Note */}
                <div className="p-3 bg-white border-t border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-800 px-3 py-2 rounded text-xs font-medium w-full max-w-3xl">
                        <Info size={16} className="shrink-0"/>
                        <span>Lưu ý: Chương trình chỉ hiển thị các bảng phân ca chi tiết thuộc cơ cấu tổ chức mà HR có quyền xem.</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Tổng số bản ghi: <b>{filteredPlans.length}</b></span>
                        <div className="flex gap-1 ml-4">
                            <button className="p-1 border rounded hover:bg-gray-100"><ChevronLeft size={14}/></button>
                            <button className="p-1 border rounded hover:bg-gray-100"><ChevronRight size={14}/></button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* === VIEW 2: MATRIX (LƯỚI PHÂN CA - LOGIC CŨ CỦA BẠN) === */}
        {viewMode === 'matrix' && (
            <div className="bg-white rounded shadow-sm border border-gray-200 h-full flex flex-col">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center bg-gray-100 rounded p-1">
                        <button onClick={() => changeWeek(-1)} className="p-1.5 hover:bg-white rounded"><ChevronLeft size={18}/></button>
                        <span className="px-3 font-bold text-gray-700 flex items-center gap-2">
                            <CalendarIcon size={14}/> {weekStart.toLocaleDateString('vi-VN')} - {weekDays[6].toLocaleDateString('vi-VN')}
                        </span>
                        <button onClick={() => changeWeek(1)} className="p-1.5 hover:bg-white rounded"><ChevronRight size={18}/></button>
                    </div>
                    <button onClick={() => setCurrentDate(new Date())} className="text-blue-600 text-xs font-bold hover:underline">Về hôm nay</button>
                </div>

                <div className="flex-1 overflow-auto">
                    {loading ? <div className="p-10 text-center"><Loader2 className="animate-spin inline mr-2"/> Đang tải...</div> : (
                    <table className="w-full min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="py-3 px-4 text-left font-bold text-gray-700 w-[200px] sticky left-0 bg-gray-50 z-10 border-r">Nhân viên</th>
                                {weekDays.map((d, i) => (
                                    <th key={i} className="py-3 px-2 text-center border-r min-w-[100px]">
                                        <div className="text-xs text-gray-500 uppercase">{d.toLocaleDateString('vi-VN', {weekday: 'short'})}</div>
                                        <div className={`text-lg font-bold ${d.toDateString()===new Date().toDateString()?'text-orange-600':''}`}>{d.getDate()}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(emp => (
                                <tr key={emp.id} className="hover:bg-gray-50 border-b">
                                    <td className="py-2 px-4 sticky left-0 bg-white z-10 border-r">
                                        <div className="font-bold text-gray-900">{emp.fullName}</div>
                                        <div className="text-xs text-gray-500">{emp.position}</div>
                                    </td>
                                    {weekDays.map((day, i) => {
                                        const dateKey = formatDateKey(day);
                                        const assignment = assignments.find(a => a.user === emp.id && a.date.startsWith(dateKey));
                                        return (
                                            <td key={i} className="p-1 text-center border-r relative h-16 align-top">
                                                {assignment ? (
                                                    <div className="text-xs p-1 rounded text-white font-bold cursor-pointer h-full flex flex-col justify-center relative group"
                                                         style={{backgroundColor: assignment.shift.color_code || '#3b82f6'}}>
                                                        <span>{assignment.shift.name}</span>
                                                        <span className="text-[9px] opacity-80">{assignment.shift.start_time}-{assignment.shift.end_time}</span>
                                                        <button onClick={() => { if(window.confirm('Xóa?')) { /* Logic xóa */ } }} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 hidden group-hover:block"><X size={10}/></button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setSelectedCell({userId: emp.id, date: dateKey, userName: emp.fullName})} className="w-full h-full flex items-center justify-center text-gray-200 hover:text-gray-400 hover:bg-gray-50"><Plus size={16}/></button>
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* MODAL CHỌN CA CHO MATRIX VIEW */}
      {selectedCell && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-80 animate-in zoom-in duration-150">
                <div className="p-3 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">Chọn ca: {selectedCell.userName}</h3>
                    <button onClick={() => setSelectedCell(null)}><X size={18}/></button>
                </div>
                <div className="p-2 max-h-80 overflow-y-auto">
                    {shifts.map(s => (
                        <button key={s.id} onClick={() => handleAssignShift(s.id)} className="w-full text-left p-2 hover:bg-orange-50 rounded border mb-2 flex justify-between items-center group">
                            <div>
                                <div className="font-bold text-sm text-gray-800 group-hover:text-orange-700">{s.name}</div>
                                <div className="text-xs text-gray-500">{s.startTime} - {s.endTime}</div>
                            </div>
                            <Plus size={16} className="text-gray-300 group-hover:text-orange-600"/>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};