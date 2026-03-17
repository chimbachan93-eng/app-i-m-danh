import React, { useState } from 'react';
import { ClassData, Session } from '../types';
import { Check, X, Calendar as CalendarIcon, Plus, ChevronLeft, Trash2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Props {
  classData: ClassData;
  onUpdate: (updates: Partial<ClassData>) => void;
}

export function AttendanceTab({ classData, onUpdate }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState(today);

  if (classData.students.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        Vui lòng thêm học viên ở tab "Học Viên" trước khi điểm danh.
      </div>
    );
  }

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if session already exists for this date
    const existingSession = classData.sessions.find(s => s.date === newDate);
    if (existingSession) {
      setSelectedSessionId(existingSession.id);
      return;
    }

    const newSession: Session = {
      id: crypto.randomUUID(),
      date: newDate,
      attendance: {}
    };

    // Add new session and sort by date descending
    const updatedSessions = [...classData.sessions, newSession].sort((a, b) => b.date.localeCompare(a.date));
    onUpdate({ sessions: updatedSessions });
    setSelectedSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa buổi học này? Toàn bộ dữ liệu điểm danh của buổi này sẽ bị mất.')) {
      onUpdate({ sessions: classData.sessions.filter(s => s.id !== id) });
      if (selectedSessionId === id) {
        setSelectedSessionId(null);
      }
    }
  };

  const handleExportExcel = () => {
    // Sort sessions chronologically for the export
    const sortedSessions = [...classData.sessions].sort((a, b) => a.date.localeCompare(b.date));

    const exportData = classData.students.map((student, index) => {
      const rowData: any = {
        'STT': index + 1,
        'Tên học viên': student.name,
        'Số điện thoại': student.phone || '',
      };

      let presentCount = 0;
      let absentCount = 0;

      sortedSessions.forEach(session => {
        const dateObj = new Date(session.date);
        const dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const status = session.attendance[student.id];
        
        if (status === true) {
          rowData[dateStr] = 'Có mặt';
          presentCount++;
        } else if (status === false) {
          rowData[dateStr] = 'Vắng';
          absentCount++;
        } else {
          rowData[dateStr] = '';
        }
      });

      rowData['Tổng có mặt'] = presentCount;
      rowData['Tổng vắng'] = absentCount;

      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Điểm danh");
    
    // Generate file name
    const fileName = `Diem_Danh_${classData.name.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // If a session is selected, show the attendance list
  if (selectedSessionId) {
    const currentSession = classData.sessions.find(s => s.id === selectedSessionId);
    if (!currentSession) {
      setSelectedSessionId(null);
      return null;
    }

    const toggleAttendance = (studentId: string, isPresent: boolean) => {
      const updatedSessions = classData.sessions.map(s => {
        if (s.id === selectedSessionId) {
          return {
            ...s,
            attendance: {
              ...s.attendance,
              [studentId]: isPresent
            }
          };
        }
        return s;
      });
      onUpdate({ sessions: updatedSessions });
    };

    const markAll = (isPresent: boolean) => {
      const newAttendance: Record<string, boolean> = {};
      classData.students.forEach(s => {
        newAttendance[s.id] = isPresent;
      });

      const updatedSessions = classData.sessions.map(s => {
        if (s.id === selectedSessionId) {
          return { ...s, attendance: newAttendance };
        }
        return s;
      });
      onUpdate({ sessions: updatedSessions });
    };

    const dateObj = new Date(currentSession.date);
    const displayDate = dateObj.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <button 
            onClick={() => setSelectedSessionId(null)}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors w-fit"
          >
            <ChevronLeft size={20} />
            <span>Quay lại danh sách buổi</span>
          </button>
          <div className="text-left sm:text-right">
            <div className="text-sm text-slate-500">Đang điểm danh cho:</div>
            <div className="font-bold text-blue-700 text-lg">{displayDate}</div>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <button 
            onClick={() => markAll(true)}
            className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 py-3 rounded-xl font-medium hover:bg-emerald-100 transition-colors active:scale-95"
          >
            Đánh dấu TẤT CẢ CÓ MẶT
          </button>
          <button 
            onClick={() => markAll(false)}
            className="flex-1 bg-rose-50 text-rose-700 border border-rose-200 py-3 rounded-xl font-medium hover:bg-rose-100 transition-colors active:scale-95"
          >
            Đánh dấu TẤT CẢ VẮNG
          </button>
        </div>

        <div className="space-y-3">
          {classData.students.map((student, index) => {
            const isPresent = currentSession.attendance[student.id];
            
            return (
              <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-medium text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div className="font-medium text-lg text-slate-800">{student.name}</div>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => toggleAttendance(student.id, true)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      isPresent === true 
                        ? 'bg-emerald-500 text-white shadow-md scale-105 ring-2 ring-emerald-200' 
                        : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                    }`}
                  >
                    <Check size={20} />
                    <span>Có mặt</span>
                  </button>
                  <button
                    onClick={() => toggleAttendance(student.id, false)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      isPresent === false 
                        ? 'bg-rose-500 text-white shadow-md scale-105 ring-2 ring-rose-200' 
                        : 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                  >
                    <X size={20} />
                    <span>Vắng</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // List of sessions view
  return (
    <div className="space-y-8 animate-in fade-in">
      <form onSubmit={handleCreateSession} className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
        <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
          <CalendarIcon size={20} />
          Tạo buổi học mới để điểm danh
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-blue-800 mb-1">Chọn ngày học</label>
            <input 
              type="date" 
              required
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="w-full p-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg bg-white"
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
            >
              <Plus size={20} />
              <span>Tạo buổi học</span>
            </button>
          </div>
        </div>
      </form>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-xl font-bold text-slate-800">Danh sách các buổi học đã tạo</h3>
          {classData.sessions.length > 0 && (
            <button
              onClick={handleExportExcel}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium hover:bg-emerald-100 transition-colors"
            >
              <Download size={18} />
              <span>Xuất file Excel</span>
            </button>
          )}
        </div>
        
        {classData.sessions.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 border-dashed text-slate-500">
            Chưa có buổi học nào. Hãy tạo buổi học mới ở trên.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {classData.sessions.map(session => {
              const dateObj = new Date(session.date);
              const displayDate = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
              
              // Count attendance
              let present = 0;
              let absent = 0;
              let unrecorded = 0;
              
              classData.students.forEach(s => {
                const status = session.attendance[s.id];
                if (status === true) present++;
                else if (status === false) absent++;
                else unrecorded++;
              });

              return (
                <div 
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="font-bold text-xl text-slate-800 flex items-center gap-2">
                      <CalendarIcon size={22} className="text-blue-500" />
                      Ngày {displayDate}
                    </div>
                    <button 
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa buổi học"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <div className="flex gap-6 text-base mt-auto bg-slate-50 p-3 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-sm">Có mặt</span>
                      <span className="font-bold text-emerald-600">{present}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-sm">Vắng</span>
                      <span className="font-bold text-rose-600">{absent}</span>
                    </div>
                    {unrecorded > 0 && (
                      <div className="flex flex-col">
                        <span className="text-slate-500 text-sm">Chưa ĐD</span>
                        <span className="font-bold text-amber-500">{unrecorded}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
