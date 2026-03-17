import { useState, useEffect } from 'react';
import { ClassData } from '../types';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where, updateDoc } from 'firebase/firestore';

export function useStore() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setClasses([]);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'classes'), where('userId', '==', user.uid));
    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const fetchedClasses: ClassData[] = [];
      snapshot.forEach((doc) => {
        fetchedClasses.push(doc.data() as ClassData);
      });
      // Sort by createdAt descending
      fetchedClasses.sort((a, b) => b.createdAt - a.createdAt);
      setClasses(fetchedClasses);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error: ", error);
      setLoading(false);
    });

    return () => unsubscribeSnapshot();
  }, [user]);

  const addClass = async (name: string, feePerSession: number) => {
    if (!user) return;
    const newClass: ClassData = {
      id: crypto.randomUUID(),
      name,
      feePerSession,
      students: [],
      sessions: [],
      userId: user.uid,
      createdAt: Date.now(),
    };
    try {
      await setDoc(doc(db, 'classes', newClass.id), newClass);
    } catch (error) {
      console.error("Error adding class: ", error);
      alert("Không thể thêm lớp học. Vui lòng thử lại.");
    }
  };

  const updateClass = async (id: string, updates: Partial<ClassData>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'classes', id), updates);
    } catch (error) {
      console.error("Error updating class: ", error);
      alert("Không thể cập nhật lớp học. Vui lòng thử lại.");
    }
  };

  const deleteClass = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'classes', id));
    } catch (error) {
      console.error("Error deleting class: ", error);
      alert("Không thể xóa lớp học. Vui lòng thử lại.");
    }
  };

  return { classes, addClass, updateClass, deleteClass, user, loading };
}
