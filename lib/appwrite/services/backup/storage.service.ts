/**
 * Storage Service
 * Handles file uploads and downloads
 */

import { ID } from 'appwrite';
import { storage } from '../config/client';
import { BUCKET_IDS } from '../config/constants';

export class StorageService {
  async uploadFile(bucketId: string, file: File, permissions?: string[]): Promise<{ $id: string; url: string }> {
    const response = await storage.createFile(bucketId, ID.unique(), file, permissions);
    const url = storage.getFileView(bucketId, response.$id);
    return { $id: response.$id, url: url.toString() };
  }

  async uploadAvatar(file: File, userId: string): Promise<{ $id: string; url: string }> {
    return this.uploadFile(BUCKET_IDS.AVATARS, file, [`read("user:${userId}")`]);
  }

  async uploadMessage(file: File): Promise<{ $id: string; url: string }> {
    return this.uploadFile(BUCKET_IDS.MESSAGES, file);
  }

  async uploadStory(file: File, userId: string): Promise<{ $id: string; url: string }> {
    return this.uploadFile(BUCKET_IDS.STORIES, file, [`read("user:${userId}")`]);
  }

  async uploadPost(file: File): Promise<{ $id: string; url: string }> {
    return this.uploadFile(BUCKET_IDS.POSTS, file);
  }

  async deleteFile(bucketId: string, fileId: string): Promise<void> {
    await storage.deleteFile(bucketId, fileId);
  }

  getFileUrl(bucketId: string, fileId: string): string {
    return storage.getFileView(bucketId, fileId).toString();
  }

  getFileDownloadUrl(bucketId: string, fileId: string): string {
    return storage.getFileDownload(bucketId, fileId).toString();
  }
}

export const storageService = new StorageService();
