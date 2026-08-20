import { ApiError } from '@/services/api-error';
import { login, signup, withdraw } from '@/services/backend/auth';

export type AuthCredentials = { email: string; password: string };
export type SignUpCredentials = AuthCredentials & { nickname: string };
export type AuthResult = { accessToken: string; userId: number; email?: string; name?: string };

export interface AuthApi {
  signIn(credentials: AuthCredentials): Promise<AuthResult>;
  signUp(credentials: SignUpCredentials): Promise<AuthResult>;
  requestPasswordReset(email: string): Promise<void>;
  withdraw(credentials: AuthCredentials): Promise<void>;
}

class HttpAuthApi implements AuthApi {
  async signIn(credentials: AuthCredentials): Promise<AuthResult> {
    const email = credentials.email.trim().toLowerCase();
    const response = await login({ email, password: credentials.password });
    if (!response.accessToken || typeof response.userId !== 'number') {
      throw new ApiError('로그인에 실패했어요. 다시 시도해 주세요.', undefined, 'NO_ACCESS_TOKEN');
    }
    return { accessToken: response.accessToken, userId: response.userId, email: response.email, name: response.name };
  }

  async signUp(credentials: SignUpCredentials): Promise<AuthResult> {
    const email = credentials.email.trim().toLowerCase();
    await signup({ email, password: credentials.password, name: credentials.nickname });
    return this.signIn(credentials);
  }

  async requestPasswordReset(): Promise<void> {
    // 백엔드에 비밀번호 재설정 엔드포인트가 아직 없다.
    throw new ApiError('아직 지원하지 않는 기능이에요.', undefined, 'NOT_IMPLEMENTED');
  }

  async withdraw(credentials: AuthCredentials): Promise<void> {
    await withdraw({ email: credentials.email.trim().toLowerCase(), password: credentials.password });
  }
}

export const authApi: AuthApi = new HttpAuthApi();
