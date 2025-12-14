import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, Loader2, Briefcase } from 'lucide-react';
import api from '../../services/apiService';
import { Employee, Shift } from '../../types';

interface ShiftAssignment {
  _id: string;
  user: string;
  shift: {
    _id: string;
    name: string;
    start_time: string;
    end_time: string;
    color_code?: string;
  };
  date: string;
}

export const ScheduleManagement = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<{ userId: string, date: string, userName: string } | null>(null);

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

      setEmployees(usersRes.data
        .filter((u: any) => u.role === 'STAFF')
        .map((u: any) => ({
          ...u,
          id: u._id || u.id
        }))
      );

      setShifts(shiftsRes.data.map((s: any) => ({
        id: s._id || s.id,
        name: s.name,
        startTime: s.start_time || s.startTime,
        endTime: s.end_time || s.endTime,
        color_code: s.color_code || '#3b82f6'
      })));

      setAssignments(assignRes.data);

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const handleAssignShift = async (shiftId: string) => {
    if (!selectedCell) return;

    try {
      const payload = {
        userId: selectedCell.userId,
        shiftId: shiftId,
        work_date: selectedCell.date,
      };

      console.log("Payload phân ca gửi đi:", payload);

      await api.post('/shift-assignments', payload);

      fetchData();
      setSelectedCell(null);
    } catch (error: any) {
      console.error("Lỗi phân ca:", error);
      const msg = error.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join('\n') : (msg || "Lỗi khi phân ca"));
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!window.confirm("Hủy phân ca này?")) return;
    try {
      await api.delete(`/shift-assignments/${assignmentId}`);
      fetchData();
    } catch (error) {
      alert("Lỗi khi xóa.");
    }
  };

  const changeWeek = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (offset * 7));
    setCurrentDate(newDate);
  };

  if (loading) return <div className="p-10 text-center flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER & NAVIGATION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Phân Ca Làm Việc</h2>
          <p className="text-sm text-gray-500">Sắp xếp lịch làm việc theo tuần</p>
        </div>

        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-white rounded-md transition-shadow shadow-sm">
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <div className="px-4 font-medium text-gray-700 flex items-center min-w-[200px] justify-center">
              <CalendarIcon size={16} className="mr-2 text-blue-600" />
              {weekStart.toLocaleDateString('vi-VN')} - {weekDays[6].toLocaleDateString('vi-VN')}
            </div>
            <button onClick={() => changeWeek(1)} className="p-2 hover:bg-white rounded-md transition-shadow shadow-sm">
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
          <button onClick={() => setCurrentDate(new Date())} className="text-sm text-blue-600 font-medium hover:underline">
            Về hôm nay
          </button>
        </div>
      </div>

      {/* SCHEDULE TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-4 px-4 text-left font-semibold text-gray-700 w-[250px] sticky left-0 bg-gray-50 z-10 border-r">
                Nhân viên
              </th>
              {weekDays.map((date, index) => (
                <th key={index} className="py-4 px-2 text-center font-semibold text-gray-700 min-w-[120px]">
                  <div className="text-xs text-gray-500 uppercase mb-1">
                    {date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg ${date.toDateString() === new Date().toDateString() ? 'text-blue-600 font-bold' : ''}`}>
                    {date.getDate()}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 sticky left-0 bg-white z-10 border-r group-hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <img src={emp.avatar || `https://ui-avatars.com/api/?name=${emp.fullName}`} alt="avt" className="w-9 h-9 rounded-full border" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{emp.fullName}</p>
                      <p className="text-xs text-gray-500">{emp.position}</p>
                    </div>
                  </div>
                </td>

                {weekDays.map((day, index) => {
                  const dateKey = formatDateKey(day);
                  const assignment = assignments.find(
                    a => a.user === emp.id && a.date.startsWith(dateKey)
                  );

                  return (
                    <td key={index} className="p-2 text-center border-l border-dashed border-gray-100 relative">
                      {assignment ? (
                        <div className="relative group">
                          <div
                            className="text-xs p-2 rounded-lg text-white font-medium shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: assignment.shift.color_code || '#3b82f6' }}
                          >
                            <p className="truncate">{assignment.shift.name}</p>
                            <p className="opacity-90 text-[10px]">{assignment.shift.start_time} - {assignment.shift.end_time}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteAssignment(assignment._id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            console.log("Chọn nhân viên:", emp.fullName, "ID:", emp.id);

                            setSelectedCell({
                              userId: emp.id,
                              date: dateKey,
                              userName: emp.fullName
                            });
                          }}
                          className="w-full h-10 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-300 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* chọn ca */}
      {selectedCell && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in duration-200">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">Chọn Ca Làm Việc</h3>
                <p className="text-xs text-gray-500 mt-1">Cho {selectedCell.userName} - Ngày {selectedCell.date}</p>
              </div>
              <button onClick={() => setSelectedCell(null)}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
            </div>

            <div className="p-4 grid gap-3 max-h-[60vh] overflow-y-auto">
              {shifts.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Chưa có cấu hình ca nào.</p>
              ) : (
                shifts.map(shift => (
                  <button
                    key={shift.id}
                    onClick={() => handleAssignShift(shift.id)}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-full group-hover:bg-white text-blue-600">
                        <Briefcase size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{shift.name}</p>
                        <p className="text-xs text-gray-500">{shift.startTime} - {shift.endTime}</p>
                      </div>
                    </div>
                    <Plus size={16} className="text-gray-400 group-hover:text-blue-600" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};