import { httpClient } from '@/services/http-client';
import type { LoginRequest, LoginResponse, SignUpRequest } from '@/types/api';

export function signup(payload: SignUpRequest) {
  return httpClient.postPublic<Record<string, unknown>>('/api/signup', payload);
}

export function login(payload: LoginRequest) {
  return httpClient.postPublic<LoginResponse>('/api/login', payload);
}

export function withdraw(payload: LoginRequest) {
  return httpClient.postPublic<Record<string, unknown>>('/api/withdraw', payload);
}
