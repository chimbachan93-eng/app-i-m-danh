export interface Student {
  id: string;
  name: string;
  phone: string;
  paidMonths?: Record<string, boolean>;
}

export interface Session {
  id: string;
  date: string; // YYYY-MM-DD
  attendance: Record<string, boolean>; // studentId -> true (present) / false (absent)
}

export interface ClassData {
  id: string;
  name: string;
  feePerSession: number;
  students: Student[];
  sessions: Session[];
  userId: string;
  createdAt: number;
}
