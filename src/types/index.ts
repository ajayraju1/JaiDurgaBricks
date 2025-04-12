export type UserRole = "admin" | "user";

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export type Worker = {
  id: string;
  name: string;
  phone: string;
  initialDebt?: number;
  createdAt: string;
};

export type WorkType =
  | "kundi"
  | "kundiDriver"
  | "brickCarry"
  | "brickBaking"
  | "brickLoadTractor"
  | "brickLoadVan"
  | "topWork";

export type WorkRecord = {
  id: string;
  workerId: string;
  workType: WorkType;
  date: string;
  amount: number;
  isDriver?: boolean;
  brickCount?: number;
  isHalfDay?: boolean;
  createdAt: string;
};

export type UsageRecord = {
  id: string;
  workerId: string;
  date: string;
  amount: number;
  createdAt: string;
};

export const workTypeDefaults = {
  kundi: { amount: 400, workers: 3 },
  kundiDriver: { amount: 500, workers: 1 },
  brickCarry: { amount: 220, perThousand: true, workers: 1 },
  brickBaking: { amount: 1200, workers: 5 },
  brickLoadTractor: { amount: 250, workers: 5, hasDriver: true },
  brickLoadVan: { amount: 300, workers: 5, hasDriver: true },
  topWork: { amount: 500, hasHalfDay: true, workers: 1 },
};
