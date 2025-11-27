/**
 * Contacts Service
 * Handles user contacts management
 */

import { ID, Query } from 'appwrite';
import { tablesDB } from '../config/client';
import { DATABASE_IDS, CHAT_TABLES } from '../config/constants';
import type { Models } from 'appwrite';

export interface Contact extends Models.Document {
  userId: string;
  contactUserId: string;
  nickname?: string;
  relationship?: string;
  isBlocked?: boolean;
  isFavorite?: boolean;
  addedAt?: string;
}

export class ContactsService {
  private readonly databaseId = DATABASE_IDS.CHAT;
  private readonly contactsCollection = CHAT_TABLES.CONTACTS;

  async addContact(userId: string, contactUserId: string, data?: Partial<Contact>): Promise<Contact> {
    const contact = await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: this.contactsCollection,
      rowId: ID.unique(),
      data: {
        userId,
        contactUserId,
        ...data,
        addedAt: new Date().toISOString(),
      }
    });
    return contact as unknown as Contact;
  }

  async getUserContacts(userId: string): Promise<Contact[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.contactsCollection,
        queries: [
          Query.equal('userId', userId),
          Query.orderDesc('addedAt'),
        ]
      });
      return response.rows as unknown as Contact[];
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }

  async updateContact(contactId: string, data: Partial<Contact>): Promise<Contact> {
    const contact = await tablesDB.updateRow({
      databaseId: this.databaseId,
      tableId: this.contactsCollection,
      rowId: contactId,
      data
    });
    return contact as unknown as Contact;
  }

  async deleteContact(contactId: string): Promise<void> {
    await tablesDB.deleteRow({
      databaseId: this.databaseId,
      tableId: this.contactsCollection,
      rowId: contactId
    });
  }
}

export const contactsService = new ContactsService();
