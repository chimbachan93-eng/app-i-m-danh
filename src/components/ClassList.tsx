import React, { useState } from 'react';
import { ClassData } from '../types';
import { Plus, Users, Trash2, ChevronRight } from 'lucide-react';

interface Props {
  classes: ClassData[];
  onAddClass: (name: string, fee: number) => void;
  onSelectClass: (id: string) => void;
  onDeleteClass: (id: string) => void;
}

export function ClassList({ classes, onAddClass, onSelectClass, onDeleteClass }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFee, setNewFee] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newFee) return;
    onAddClass(newName.trim(), parseInt(newFee));
    setNewName('');
    setNewFee('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Danh sách Lớp học</h2>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
          >
            <Plus size={20} />
            <span>Thêm Lớp Mới</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold">Tạo lớp học mới</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên lớp học (Ví dụ: Lớp Tiếng Anh Giao Tiếp K1)</label>
              <input 
                type="text" 
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                placeholder="Nhập tên lớp..."
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Học phí mỗi buổi (VNĐ)</label>
              <input 
                type="number" 
                required
                min="0"
                step="1000"
                value={newFee}
                onChange={e => setNewFee(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                placeholder="Ví dụ: 100000"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700"
            >
              Lưu Lớp Học
            </button>
            <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200"
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      )}

      {classes.length === 0 && !isAdding ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-blue-500" />
          </div>
          <h3 className="text-xl font-medium text-slate-800 mb-2">Chưa có lớp học nào</h3>
          <p className="text-slate-500 mb-6">Hãy bấm nút "Thêm Lớp Mới" để bắt đầu quản lý.</p>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 shadow-sm"
          >
            Thêm Lớp Mới Ngay
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {classes.map(c => (
            <div 
              key={c.id} 
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer flex flex-col"
              onClick={() => onSelectClass(c.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-800 line-clamp-2">{c.name}</h3>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Bạn có chắc chắn muốn xóa lớp "${c.name}" không? Mọi dữ liệu điểm danh sẽ bị mất.`)) {
                      onDeleteClass(c.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa lớp học"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              
              <div className="mt-auto space-y-2">
                <div className="flex items-center text-slate-600">
                  <Users size={18} className="mr-2" />
                  <span>{c.students.length} học viên</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <span className="font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-sm">
                    {c.feePerSession.toLocaleString('vi-VN')} đ / buổi
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-blue-600 font-medium group-hover:text-blue-700">
                <span>Vào quản lý lớp</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
