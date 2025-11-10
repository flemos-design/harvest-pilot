// Auth types for HarvestPilot frontend

export interface User {
  id: string;
  email: string;
  nome: string;
  papel: 'ADMIN' | 'GESTOR' | 'PLANEADOR' | 'OPERADOR';
  organizacaoId: string;
  organizacao: {
    id: string;
    nome: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  nome: string;
  password: string;
  papel?: 'ADMIN' | 'GESTOR' | 'PLANEADOR' | 'OPERADOR';
  organizacaoId?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}
