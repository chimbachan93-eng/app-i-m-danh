import React, { useState } from 'react';
import { ClassData } from '../types';
import { Users, CalendarCheck, Calculator } from 'lucide-react';
import { StudentsTab } from './StudentsTab';
import { AttendanceTab } from './AttendanceTab';
import { TuitionTab } from './TuitionTab';

interface Props {
  classData: ClassData;
  onUpdate: (updates: Partial<ClassData>) => void;
}

type Tab = 'students' | 'attendance' | 'tuition';

export function ClassDetail({ classData, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('attendance');

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{classData.name}</h2>
        <p className="text-slate-600">
          Học phí: <strong className="text-blue-600">{classData.feePerSession.toLocaleString('vi-VN')} VNĐ</strong> / buổi
          <span className="mx-3 text-slate-300">|</span>
          Sĩ số: <strong>{classData.students.length}</strong> học viên
        </p>
      </div>

      <div className="flex overflow-x-auto bg-white rounded-xl p-1 shadow-sm border border-slate-200">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === 'attendance' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CalendarCheck size={20} />
          <span>Điểm Danh</span>
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === 'students' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users size={20} />
          <span>Học Viên</span>
        </button>
        <button
          onClick={() => setActiveTab('tuition')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === 'tuition' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Calculator size={20} />
          <span>Tính Học Phí</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 min-h-[400px]">
        {activeTab === 'students' && <StudentsTab classData={classData} onUpdate={onUpdate} />}
        {activeTab === 'attendance' && <AttendanceTab classData={classData} onUpdate={onUpdate} />}
        {activeTab === 'tuition' && <TuitionTab classData={classData} onUpdate={onUpdate} />}
      </div>
    </div>
  );
}
