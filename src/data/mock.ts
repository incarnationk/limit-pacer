export type Role = 'SM' | 'Mgr' | 'AM' | 'L' | 'AL' | 'T' | 'H' | 'BP';

export interface Member {
  id: string; // "No"
  group: string; // "Group" (Previously Team)
  location: string; // "場所"
  name: string; // "氏名"
  role: Role; // "役柄"
  email?: string; // "Email"
  authority?: 'admin' | string; // "権限"
  team?: string; // "チーム" (New column)
}

export interface Task {
  id: string;
  content: string;
  deadline: string; // YYYY-MM-DD
  target: '全員' | '管理者' | '役職者' | '社員' | 'BP';

  link?: string;
  completedBy: string[]; // List of member IDs who completed this
  isCompleted?: boolean; // Computed on frontend (if current user is in completedBy)
  notes?: string;
  rowIndex?: number; // For Excel Graph API updates
}

export const MOCK_MEMBERS: Member[] = [
  { id: '1', group: 'Development', location: 'Tokyo', name: 'Yamada Taro', role: 'L' },
  { id: '2', group: 'Sales', location: 'Osaka', name: 'Suzuki Ichiro', role: 'T' },
  { id: '3', group: 'HR', location: 'Tokyo', name: 'Sato Hanako', role: 'AL' },
];

export const MOCK_TASKS: Task[] = [
  {
    id: '101',
    content: 'Security Training 2024',
    link: 'https://example.com',
    target: '全員',
    deadline: '2024-12-31',
    notes: 'Mandatory',
    completedBy: []
  },
  {
    id: '102',
    content: 'Timesheet Submission',
    link: 'https://example.com',
    target: '社員',
    deadline: '2025-01-05',
    notes: 'By end of day',
    completedBy: []
  },
  {
    id: '103',
    content: 'Manager Review',
    target: '管理者',
    deadline: '2025-01-10',
    completedBy: []
  },
  {
    id: '104',
    content: 'Quarterly Goal Setting',
    target: '全員',
    deadline: '2024-12-15', // Expired
    completedBy: []
  }
];

// Helper to calculate status
export const getTaskStatus = (deadline: string) => {
  const today = new Date().toISOString().split('T')[0];
  if (deadline < today) return 'expired';
  if (deadline === today) return 'urgent';
  return 'normal';
};
