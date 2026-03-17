import React, { useState } from 'react';
import { ClassData, Student } from '../types';
import { Plus, Trash2, Phone } from 'lucide-react';

interface Props {
  classData: ClassData;
  onUpdate: (updates: Partial<ClassData>) => void;
}

export function StudentsTab({ classData, onUpdate }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim()
    };
    
    onUpdate({ students: [...classData.students, newStudent] });
    setName('');
    setPhone('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa học viên này?')) {
      onUpdate({ students: classData.students.filter(s => s.id !== id) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800">Danh sách Học viên</h3>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors"
          >
            <Plus size={20} />
            <span>Thêm Học Viên</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên học viên</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nhập tên..."
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại (Không bắt buộc)</label>
              <input 
                type="tel" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nhập SĐT..."
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
            >
              Lưu
            </button>
            <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-50"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {classData.students.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          Chưa có học viên nào trong lớp. Hãy thêm học viên để bắt đầu điểm danh.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {classData.students.map((student, index) => (
            <div key={student.id} className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-slate-800 text-lg">{student.name}</div>
                  {student.phone && (
                    <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <Phone size={14} />
                      {student.phone}
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => handleDelete(student.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
