import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '@/types/auth';
import { apiClient } from './client';

// Login
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post('/utilizadores/login', data);
  return response.data;
}

// Register
export async function register(data: RegisterRequest): Promise<User> {
  const response = await apiClient.post('/utilizadores', data);
  return response.data;
}

// Get current user (requires token)
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get('/utilizadores/me');
  return response.data;
}

// Forgot password
export async function forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
  const response = await apiClient.post('/utilizadores/forgot-password', data);
  return response.data;
}

// Reset password
export async function resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
  const response = await apiClient.post('/utilizadores/reset-password', data);
  return response.data;
}

// Change password
export async function changePassword(userId: string, data: ChangePasswordRequest): Promise<{ message: string }> {
  const response = await apiClient.patch(`/utilizadores/${userId}/password`, data);
  return response.data;
}

// Update user profile
export async function updateProfile(userId: string, data: Partial<User>): Promise<User> {
  const response = await apiClient.patch(`/utilizadores/${userId}`, data);
  return response.data;
}
