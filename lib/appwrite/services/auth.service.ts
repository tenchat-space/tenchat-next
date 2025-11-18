/**
 * Authentication Service
 * Handles user authentication
 */

import { ID } from 'appwrite';
import { account } from '../config/client';
import type { Models } from 'appwrite';

export class AuthService {
  
  async createAccount(email: string, password: string, name: string): Promise<Models.User<Models.Preferences>> {
    try {
      return await account.create(ID.unique(), email, password, name);
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<Models.Session> {
    try {
      return await account.createEmailPasswordSession(email, password);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
    try {
      return await account.get();
    } catch (error) {
      return null;
    }
  }

  async getSession(): Promise<Models.Session | null> {
    try {
      return await account.getSession('current');
    } catch (error) {
      return null;
    }
  }

  async updateName(name: string): Promise<Models.User<Models.Preferences>> {
    try {
      return await account.updateName(name);
    } catch (error) {
      console.error('Error updating name:', error);
      throw error;
    }
  }

  async updateEmail(email: string, password: string): Promise<Models.User<Models.Preferences>> {
    try {
      return await account.updateEmail(email, password);
    } catch (error) {
      console.error('Error updating email:', error);
      throw error;
    }
  }

  async updatePassword(newPassword: string, oldPassword: string): Promise<Models.User<Models.Preferences>> {
    try {
      return await account.updatePassword(newPassword, oldPassword);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  async createRecovery(email: string, url: string): Promise<Models.Token> {
    try {
      return await account.createRecovery(email, url);
    } catch (error) {
      console.error('Error creating recovery:', error);
      throw error;
    }
  }

  async updateRecovery(userId: string, secret: string, password: string): Promise<Models.Token> {
    try {
      return await account.updateRecovery(userId, secret, password);
    } catch (error) {
      console.error('Error updating recovery:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
