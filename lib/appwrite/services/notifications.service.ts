/**
 * Notifications Service
 * Handles user notifications
 */

import { ID, Query } from 'appwrite';
import { tablesDB } from '../config/client';
import { DATABASE_IDS, ANALYTICS_COLLECTIONS } from '../config/constants';

type NotificationRow = Record<string, any>;

export class NotificationsService {
  private readonly databaseId = DATABASE_IDS.ANALYTICS;
  private readonly tableId = ANALYTICS_COLLECTIONS.NOTIFICATIONS;

  /**
   * Create a notification
   */
  async createNotification(data: Partial<NotificationRow>): Promise<NotificationRow> {
    return await tablesDB.createRow({
      databaseId: this.databaseId,
      tableId: this.tableId,
      rowId: ID.unique(),
      data: {
        ...data,
        isRead: false,
        createdAt: new Date().toISOString(),
      }
    }) as unknown as NotificationRow;
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, limit = 50, onlyUnread = false): Promise<NotificationRow[]> {
    try {
      const queries = [
        Query.equal('userId', userId),
        Query.orderDesc('createdAt'),
        Query.limit(limit),
      ];

      if (onlyUnread) {
        queries.push(Query.equal('isRead', false));
      }

      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries,
      });
      return response.rows as NotificationRow[];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<NotificationRow> {
    return await tablesDB.updateRow({
      databaseId: this.databaseId,
      tableId: this.tableId,
      rowId: notificationId,
      data: {
        isRead: true,
        readAt: new Date().toISOString(),
      }
    }) as unknown as NotificationRow;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    const notifications = await this.getUserNotifications(userId, 100, true);
    for (const notification of notifications) {
      await this.markAsRead(notification.$id);
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await tablesDB.deleteRow({
      databaseId: this.databaseId,
      tableId: this.tableId,
      rowId: notificationId
    });
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const unread = await this.getUserNotifications(userId, 999, true);
    return unread.length;
  }
}

export const notificationsService = new NotificationsService();
