/**
 * Contacts Service
 * Handles user contacts management
 */

import { ID, Query } from 'appwrite';
import { databases } from '../config/client';
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
    const contact = await databases.createDocument(
      this.databaseId,
      this.contactsCollection,
      ID.unique(),
      {
        userId,
        contactUserId,
        ...data,
        addedAt: new Date().toISOString(),
      }
    );
    return contact as Contact;
  }

  async getUserContacts(userId: string): Promise<Contact[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.contactsCollection,
        [
          Query.equal('userId', userId),
          Query.orderDesc('addedAt'),
        ]
      );
      return response.documents as Contact[];
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }

  async updateContact(contactId: string, data: Partial<Contact>): Promise<Contact> {
    const contact = await databases.updateDocument(
      this.databaseId,
      this.contactsCollection,
      contactId,
      data
    );
    return contact as Contact;
  }

  async deleteContact(contactId: string): Promise<void> {
    await databases.deleteDocument(
      this.databaseId,
      this.contactsCollection,
      contactId
    );
  }
}

export const contactsService = new ContactsService();
