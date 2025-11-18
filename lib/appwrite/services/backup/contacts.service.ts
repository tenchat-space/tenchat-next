/**
 * Contacts Service
 * Handles user contacts and relationships
 */

import { ID, Query } from 'appwrite';
import { tablesDB } from '../config/client';
import { DATABASE_IDS, MAIN_COLLECTIONS } from '../config/constants';
import type { Contacts } from '@/types/appwrite.d';

export class ContactsService {
  private readonly databaseId = DATABASE_IDS.MAIN;
  private readonly tableId = MAIN_COLLECTIONS.CONTACTS;

  /**
   * Add a contact
   */
  async addContact(userId: string, contactUserId: string, data?: Partial<Contacts>): Promise<Contacts> {
    return await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: this.tableId,
      rowId: ID.unique(),
      data: {
        userId,
        contactUserId,
        status: 'active',
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }) as Contacts;
  }

  /**
   * Get user's contacts
   */
  async getContacts(userId: string, limit = 100): Promise<Contacts[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries: [
          Query.equal('userId', userId),
          Query.equal('status', 'active'),
          Query.orderDesc('createdAt'),
          Query.limit(limit),
        ]
      });
      return response.rows as Contacts[];
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }

  /**
   * Check if contact exists
   */
  async isContact(userId: string, contactUserId: string): Promise<boolean> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries: [
          Query.equal('userId', userId),
          Query.equal('contactUserId', contactUserId),
          Query.limit(1),
        ]
      });
      return response.rows.length > 0;
    } catch (error) {
      console.error('Error checking contact:', error);
      return false;
    }
  }

  /**
   * Block a contact
   */
  async blockContact(contactId: string): Promise<Contacts> {
    return await tablesDB.updateRow({
      databaseId: this.databaseId,
      tableId: this.tableId,
      rowId: contactId,
      data: {
        status: 'blocked',
        updatedAt: new Date().toISOString(),
      }
    }) as Contacts;
  }

  /**
   * Unblock a contact
   */
  async unblockContact(contactId: string): Promise<Contacts> {
    return await tablesDB.updateRow({
      databaseId: this.databaseId,
      tableId: this.tableId,
      rowId: contactId,
      data: {
        status: 'active',
        updatedAt: new Date().toISOString(),
      }
    }) as Contacts;
  }

  /**
   * Delete a contact
   */
  async deleteContact(contactId: string): Promise<void> {
    await tablesDB.deleteRow({
      databaseId: this.databaseId,
      tableId: this.tableId,
      rowId: contactId
    });
  }

  /**
   * Get blocked contacts
   */
  async getBlockedContacts(userId: string): Promise<Contacts[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries: [
          Query.equal('userId', userId),
          Query.equal('status', 'blocked'),
        ]
      });
      return response.rows as Contacts[];
    } catch (error) {
      console.error('Error getting blocked contacts:', error);
      return [];
    }
  }
}

export const contactsService = new ContactsService();
