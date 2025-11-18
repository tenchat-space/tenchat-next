/**
 * Authentication Service
 * Handles all authentication methods as specified in appwrite.config.json
 * Methods: JWT, Phone, Email-OTP, Magic URL, Email-Password, Anonymous, Invites
 */

import { account, functions } from '../config/client';
import { ID } from 'appwrite';
import type { Models } from 'appwrite';

export interface AuthResult {
  success: boolean;
  user?: Models.User<Models.Preferences>;
  session?: Models.Session;
  error?: string;
}

export interface WalletAuthParams {
  email: string;
  address: string;
  signature: string;
  message: string;
}

export class AuthService {
  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await account.get();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
    try {
      const user = await account.get();
      return user;
    } catch {
      return null;
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Models.Session | null> {
    try {
      const session = await account.getSession('current');
      return session;
    } catch {
      return null;
    }
  }

  /**
   * Login with Wallet (Web3)
   * Uses Appwrite Function for wallet signature verification
   */
  async loginWithWallet(params: WalletAuthParams): Promise<AuthResult> {
    try {
      const functionId = process.env.NEXT_PUBLIC_WEB3_FUNCTION_ID;
      
      if (!functionId) {
        return {
          success: false,
        error: 'Web3 function not configured. Set NEXT_PUBLIC_WEB3_FUNCTION_ID.'
        };
      }

      // Call Web3 authentication function
      const execution = await functions.createExecution(
        functionId,
        JSON.stringify(params),
        false
      );

      const response = JSON.parse(execution.responseBody || '{}');

      if (execution.responseStatusCode !== 200) {
        return {
          success: false,
          error: response.error || 'Wallet authentication failed'
        };
      }

      // Create session with returned credentials
      const session = await account.createSession(
        response.userId,
        response.secret
      );

      const user = await account.get();

      return {
        success: true,
        user,
        session
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Wallet authentication failed'
      };
    }
  }

  /**
   * Login with Email & Password
   */
  async loginWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      const user = await account.get();

      return {
        success: true,
        user,
        session
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Email login failed'
      };
    }
  }

  /**
   * Register with Email & Password
   */
  async registerWithEmail(
    email: string,
    password: string,
    name?: string
  ): Promise<AuthResult> {
    try {
      const user = await account.create(
        ID.unique(),
        email,
        password,
        name
      );

      // Automatically login after registration
      const session = await account.createEmailPasswordSession(email, password);

      return {
        success: true,
        user,
        session
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    }
  }

  /**
   * Send Email OTP
   */
  async sendEmailOTP(email: string): Promise<AuthResult> {
    try {
      const token = await account.createEmailToken(ID.unique(), email);

      return {
        success: true,
        user: token as any // Token userId
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send OTP'
      };
    }
  }

  /**
   * Verify Email OTP
   */
  async verifyEmailOTP(userId: string, secret: string): Promise<AuthResult> {
    try {
      const session = await account.createSession(userId, secret);
      const user = await account.get();

      return {
        success: true,
        user,
        session
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'OTP verification failed'
      };
    }
  }

  /**
   * Send Magic URL
   */
  async sendMagicURL(email: string, url?: string): Promise<AuthResult> {
    try {
      const redirectUrl = url || `${window.location.origin}/auth/magic`;
      const token = await account.createMagicURLToken(
        ID.unique(),
        email,
        redirectUrl
      );

      return {
        success: true,
        user: token as any
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send magic URL'
      };
    }
  }

  /**
   * Verify Magic URL Token
   */
  async verifyMagicURL(userId: string, secret: string): Promise<AuthResult> {
    try {
      const session = await account.createSession(userId, secret);
      const user = await account.get();

      return {
        success: true,
        user,
        session
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Magic URL verification failed'
      };
    }
  }

  /**
   * Send Phone OTP
   */
  async sendPhoneOTP(phone: string): Promise<AuthResult> {
    try {
      const token = await account.createPhoneToken(ID.unique(), phone);

      return {
        success: true,
        user: token as any
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send phone OTP'
      };
    }
  }

  /**
   * Verify Phone OTP
   */
  async verifyPhoneOTP(userId: string, secret: string): Promise<AuthResult> {
    try {
      const session = await account.createSession(userId, secret);
      const user = await account.get();

      return {
        success: true,
        user,
        session
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Phone OTP verification failed'
      };
    }
  }

  /**
   * Create Anonymous Session
   */
  async loginAnonymous(): Promise<AuthResult> {
    try {
      const user = await account.createAnonymousSession();

      return {
        success: true,
        user: user as any
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Anonymous login failed'
      };
    }
  }

  /**
   * Create JWT for API authentication
   */
  async createJWT(): Promise<string | null> {
    try {
      const jwt = await account.createJWT();
      return jwt.jwt;
    } catch {
      return null;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(prefs: Record<string, any>): Promise<Models.User<Models.Preferences> | null> {
    try {
      const user = await account.updatePrefs(prefs);
      return user;
    } catch {
      return null;
    }
  }

  /**
   * Update user name
   */
  async updateName(name: string): Promise<Models.User<Models.Preferences> | null> {
    try {
      const user = await account.updateName(name);
      return user;
    } catch {
      return null;
    }
  }

  /**
   * Update user email
   */
  async updateEmail(email: string, password: string): Promise<Models.User<Models.Preferences> | null> {
    try {
      const user = await account.updateEmail(email, password);
      return user;
    } catch {
      return null;
    }
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string, oldPassword: string): Promise<Models.User<Models.Preferences> | null> {
    try {
      const user = await account.updatePassword(newPassword, oldPassword);
      return user;
    } catch {
      return null;
    }
  }

  /**
   * Update user phone
   */
  async updatePhone(phone: string, password: string): Promise<Models.User<Models.Preferences> | null> {
    try {
      const user = await account.updatePhone(phone, password);
      return user;
    } catch {
      return null;
    }
  }

  /**
   * Send password recovery email
   */
  async sendPasswordRecovery(email: string, url?: string): Promise<AuthResult> {
    try {
      const redirectUrl = url || `${window.location.origin}/auth/recovery`;
      const token = await account.createRecovery(email, redirectUrl);

      return {
        success: true,
        user: token as any
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send recovery email'
      };
    }
  }

  /**
   * Complete password recovery
   */
  async completePasswordRecovery(
    userId: string,
    secret: string,
    password: string
  ): Promise<AuthResult> {
    try {
      const token = await account.updateRecovery(userId, secret, password);

      return {
        success: true,
        user: token as any
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Password recovery failed'
      };
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(url?: string): Promise<AuthResult> {
    try {
      const redirectUrl = url || `${window.location.origin}/auth/verify`;
      const token = await account.createVerification(redirectUrl);

      return {
        success: true,
        user: token as any
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send verification email'
      };
    }
  }

  /**
   * Complete email verification
   */
  async verifyEmail(userId: string, secret: string): Promise<AuthResult> {
    try {
      const token = await account.updateVerification(userId, secret);

      return {
        success: true,
        user: token as any
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Email verification failed'
      };
    }
  }

  /**
   * Send phone verification
   */
  async sendPhoneVerification(): Promise<AuthResult> {
    try {
      const token = await account.createPhoneVerification();

      return {
        success: true,
        user: token as any
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send phone verification'
      };
    }
  }

  /**
   * Complete phone verification
   */
  async verifyPhone(userId: string, secret: string): Promise<AuthResult> {
    try {
      const token = await account.updatePhoneVerification(userId, secret);

      return {
        success: true,
        user: token as any
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Phone verification failed'
      };
    }
  }

  /**
   * List all sessions
   */
  async listSessions(): Promise<Models.Session[]> {
    try {
      const sessions = await account.listSessions();
      return sessions.sessions;
    } catch {
      return [];
    }
  }

  /**
   * Delete specific session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await account.deleteSession(sessionId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete all sessions (logout from all devices)
   */
  async deleteAllSessions(): Promise<boolean> {
    try {
      await account.deleteSessions();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Logout (delete current session)
   */
  async logout(): Promise<boolean> {
    try {
      await account.deleteSession('current');
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
