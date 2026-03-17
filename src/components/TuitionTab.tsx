import React, { useState, useMemo } from 'react';
import { ClassData } from '../types';

interface Props {
  classData: ClassData;
  onUpdate: (updates: Partial<ClassData>) => void;
}

export function TuitionTab({ classData, onUpdate }: Props) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Calculate tuition for the selected month
  const tuitionData = useMemo(() => {
    const [selectedYear, selectedMonth] = month.split('-');
    
    // Filter sessions in the selected month
    const monthSessions = classData.sessions.filter(s => {
      const [year, m] = s.date.split('-');
      return year === selectedYear && m === selectedMonth;
    });

    return classData.students.map(student => {
      let presentCount = 0;
      let absentCount = 0;
      
      monthSessions.forEach(session => {
        const status = session.attendance[student.id];
        if (status === true) presentCount++;
        if (status === false) absentCount++;
      });

      const totalFee = presentCount * classData.feePerSession;

      return {
        ...student,
        presentCount,
        absentCount,
        totalFee
      };
    }).sort((a, b) => b.totalFee - a.totalFee); // Sort by highest fee first
  }, [classData, month]);

  const totalClassFee = tuitionData.reduce((sum, s) => sum + s.totalFee, 0);

  const handleTogglePaid = (studentId: string, currentStatus: boolean) => {
    const updatedStudents = classData.students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          paidMonths: {
            ...(s.paidMonths || {}),
            [month]: !currentStatus
          }
        };
      }
      return s;
    });
    onUpdate({ students: updatedStudents });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1">Chọn tháng tính học phí</label>
          <input 
            type="month" 
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="bg-white border border-slate-300 text-slate-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
          />
        </div>
        <div className="text-right bg-blue-50 p-3 rounded-lg border border-blue-100">
          <div className="text-sm text-blue-600 font-medium">Tổng thu dự kiến tháng này</div>
          <div className="text-2xl font-bold text-blue-700">{totalClassFee.toLocaleString('vi-VN')} đ</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase text-sm font-semibold border-b border-slate-200">
            <tr>
              <th className="px-4 py-4">STT</th>
              <th className="px-4 py-4">Học viên</th>
              <th className="px-4 py-4 text-center">Số buổi học</th>
              <th className="px-4 py-4 text-center">Số buổi vắng</th>
              <th className="px-4 py-4 text-right">Thành tiền (VNĐ)</th>
              <th className="px-4 py-4 text-center">Trạng thái nộp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {tuitionData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Không có dữ liệu học viên
                </td>
              </tr>
            ) : (
              tuitionData.map((student, index) => {
                const isPaid = !!student.paidMonths?.[month];
                return (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 font-medium">{index + 1}</td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-800 text-base">{student.name}</div>
                    {student.phone && <div className="text-sm text-slate-500">{student.phone}</div>}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                      {student.presentCount}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold">
                      {student.absentCount}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-blue-600 text-lg">
                    {student.totalFee.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => handleTogglePaid(student.id, isPaid)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200 shadow-sm'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {isPaid ? 'Đã nộp' : 'Chưa nộp'}
                    </button>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      <div className="text-sm text-slate-500 text-center">
        * Học phí được tính dựa trên số buổi học viên "Có mặt" nhân với học phí mỗi buổi ({classData.feePerSession.toLocaleString('vi-VN')} đ).
      </div>
    </div>
  );
}
