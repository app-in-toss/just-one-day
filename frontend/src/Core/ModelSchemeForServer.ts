// Firestore 컬렉션 스키마에 대응하는 타입 및 파서
// 클라이언트에서 백엔드 API 응답을 파싱할 때 사용

export interface User {
  userId: string; // uid
  name: string | null; // 이름
  email: string | null; // 이메일
  gender: string | null; // 성별
  totalPoints: number; // 포인트
  currentStreak: number; // 현재 연속 성공 일수
  longestStreak: number; // 최장 연속 기록 (일 단위)
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  isDefault: boolean;
  unitPrice: number;
  createdAt: string;
}

export type ChallengeStatus = 'active' | 'completed' | 'failed';

export interface Challenge {
  id: string;
  categoryId: string;
  categoryName: string;
  weekStart: string;
  weekEnd: string;
  status: ChallengeStatus;
  dailyChecks: Record<string, boolean>;
  successDays: number;
  createdAt: string;
}

export type PointType = 'challenge_complete' | 'streak_bonus';

export interface PointHistory {
  id: string;
  amount: number;
  type: PointType;
  challengeId: string;
  date: string;
  createdAt: string;
}

// --- 파서 ---

export function parseUser(data: any): User {
  return {
    userId: data.userId ?? '',
    name: data.name ?? null,
    email: data.email ?? null,
    gender: data.gender ?? null,
    totalPoints: data.totalPoints ?? 0,
    currentStreak: data.currentStreak ?? 0,
    longestStreak: data.longestStreak ?? 0,
    createdAt: data.createdAt ?? '',
    updatedAt: data.updatedAt ?? '',
  };
}

export function parseCategory(data: any): Category {
  return {
    id: data.id ?? '',
    name: data.name ?? '',
    icon: data.icon ?? '',
    description: data.description ?? '',
    isDefault: data.isDefault ?? false,
    unitPrice: data.unitPrice ?? 0,
    createdAt: data.createdAt ?? '',
  };
}

export function parseChallenge(data: any): Challenge {
  return {
    id: data.id ?? '',
    categoryId: data.categoryId ?? '',
    categoryName: data.categoryName ?? '',
    weekStart: data.weekStart ?? '',
    weekEnd: data.weekEnd ?? '',
    status: data.status ?? 'active',
    dailyChecks: data.dailyChecks ?? {},
    successDays: data.successDays ?? 0,
    createdAt: data.createdAt ?? '',
  };
}

export function parsePointHistory(data: any): PointHistory {
  return {
    id: data.id ?? '',
    amount: data.amount ?? 0,
    type: data.type ?? 'challenge_complete',
    challengeId: data.challengeId ?? '',
    date: data.date ?? '',
    createdAt: data.createdAt ?? '',
  };
}
