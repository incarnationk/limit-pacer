export type Role = '全メンバー' | '社員' | '社員＋AL' | '役職者' | '主任' | 'リーダー' | '担当' | 'BP' | '派遣' | '準委任';

export interface Member {
  id: string; // "No"
  team: string; // "Team"
  location: string; // "場所"
  name: string; // "氏名"
  role: Role; // "役柄"
}

export interface Task {
  id: string; // "登録番号"
  content: string; // "内容"
  link?: string; // "リンク"
  notes?: string; // "特記事項"
  target: string; // "対象" (Could be a role or team name)
  deadline: string; // "期限" (ISO Date string: YYYY-MM-DD)
  isCompleted?: boolean; // App-specific state
}

export const MOCK_MEMBERS: Member[] = [
  { id: '1', team: 'Development', location: 'Tokyo', name: '山田 太郎', role: 'リーダー' },
  { id: '2', team: 'Development', location: 'Osaka', name: '鈴木 一郎', role: '社員' },
  { id: '3', team: 'Sales', location: 'Tokyo', name: '佐藤 花子', role: '主任' },
  { id: '4', team: 'Sales', location: 'Fukuoka', name: '田中 次郎', role: 'BP' },
  { id: '5', team: 'HR', location: 'Tokyo', name: '高橋 三郎', role: '役職者' },
];

export const MOCK_TASKS: Task[] = [
  { 
    id: 'T001', 
    content: '情報セキュリティ研修 2025', 
    link: 'https://example.com/security', 
    target: '全メンバー', 
    deadline: '2025-12-25', // Immediate/Safe
    notes: '必須受講'
  },
  { 
    id: 'T002', 
    content: 'コンプライアンス誓約書の提出', 
    link: 'https://example.com/compliance', 
    target: '社員', 
    deadline: '2025-12-20', // TODAY! (Urgent)
    notes: '未提出者はアカウント停止'
  },
  { 
    id: 'T003', 
    content: '年末調整の入力', 
    target: '社員＋AL', 
    deadline: '2025-11-30', // EXPIRED!
    notes: 'お早めに'
  },
  { 
    id: 'T004', 
    content: 'リーダーシップ研修', 
    target: 'リーダー', 
    deadline: '2026-01-31', // Future
  }
];

// Helper to calculate status
export const getTaskStatus = (deadline: string) => {
  const today = new Date().toISOString().split('T')[0];
  if (deadline < today) return 'expired';
  if (deadline === today) return 'urgent';
  return 'normal';
};
