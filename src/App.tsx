import React, { useState, useRef } from 'react';
import { useStore } from './hooks/useStore';
import { ClassList } from './components/ClassList';
import { ClassDetail } from './components/ClassDetail';
import { GraduationCap, Download, Upload, LogOut, LogIn } from 'lucide-react';
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ClassData } from './types';

export default function App() {
  const { classes, addClass, updateClass, deleteClass, user, loading } = useStore();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedClass = classes.find(c => c.id === selectedClassId);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      alert("Đăng nhập thất bại. Vui lòng thử lại.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(classes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `So_Diem_Danh_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedData)) {
          if (window.confirm('Bạn có chắc chắn muốn phục hồi dữ liệu này lên đám mây?')) {
            for (const classItem of importedData) {
              const newClass: ClassData = {
                ...classItem,
                userId: user.uid,
                createdAt: classItem.createdAt || Date.now()
              };
              await setDoc(doc(db, 'classes', newClass.id), newClass);
            }
            alert('Phục hồi dữ liệu thành công!');
          }
        } else {
          alert('File dữ liệu không hợp lệ!');
        }
      } catch (error) {
        alert('Lỗi khi đọc file dữ liệu!');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 font-medium flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Sổ Điểm Danh Đám Mây</h1>
          <p className="text-slate-600">
            Đăng nhập để lưu trữ và đồng bộ dữ liệu điểm danh của bạn trên mọi thiết bị một cách an toàn.
          </p>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-all active:scale-95 shadow-md hover:shadow-lg"
          >
            <LogIn size={20} />
            Đăng nhập bằng Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-blue-600 text-white shadow-md p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setSelectedClassId(null)}
          >
            <div className="bg-white/20 p-2 rounded-xl">
              <GraduationCap size={28} className="text-white" />
            </div>
            <h1 className="text-xl font-bold">Sổ Điểm Danh</h1>
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0">
            {!selectedClass ? (
              <>
                <button 
                  onClick={handleExportData}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                  title="Tải xuống bản sao lưu dữ liệu"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">Sao lưu</span>
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                  title="Phục hồi dữ liệu từ file"
                >
                  <Upload size={18} />
                  <span className="hidden sm:inline">Phục hồi</span>
                </button>
                <input 
                  type="file" 
                  accept=".json" 
                  ref={fileInputRef} 
                  onChange={handleImportData} 
                  className="hidden" 
                />
              </>
            ) : (
              <button 
                onClick={() => setSelectedClassId(null)}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg font-medium transition-colors whitespace-nowrap"
              >
                Trở về trang chủ
              </button>
            )}
            
            <div className="w-px h-8 bg-blue-500 mx-1 hidden sm:block"></div>
            
            <div className="flex items-center gap-3 pl-1">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full border-2 border-blue-400"
              />
              <button 
                onClick={handleLogout}
                className="p-2 text-blue-100 hover:text-white hover:bg-blue-700 rounded-lg transition-colors"
                title="Đăng xuất"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-8">
        {!selectedClass ? (
          <ClassList 
            classes={classes} 
            onAddClass={addClass} 
            onSelectClass={setSelectedClassId} 
            onDeleteClass={deleteClass}
          />
        ) : (
          <ClassDetail 
            classData={selectedClass} 
            onUpdate={(updates) => updateClass(selectedClass.id, updates)} 
          />
        )}
      </main>
    </div>
  );
}
