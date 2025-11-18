/**
 * Storage Service
 * Handles file uploads and management
 */

import { ID } from 'appwrite';
import { storage } from '../config/client';
import { BUCKET_IDS } from '../config/constants';
import type { Models } from 'appwrite';

export class StorageService {
  
  async uploadFile(bucketId: string, file: File, fileId?: string): Promise<Models.File> {
    try {
      return await storage.createFile(
        bucketId,
        fileId || ID.unique(),
        file
      );
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async deleteFile(bucketId: string, fileId: string): Promise<void> {
    try {
      await storage.deleteFile(bucketId, fileId);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async getFilePreview(
    bucketId: string,
    fileId: string,
    width?: number,
    height?: number
  ): Promise<URL> {
    try {
      return storage.getFilePreview(
        bucketId,
        fileId,
        width,
        height
      );
    } catch (error) {
      console.error('Error getting file preview:', error);
      throw error;
    }
  }

  async getFileView(bucketId: string, fileId: string): Promise<URL> {
    try {
      return storage.getFileView(bucketId, fileId);
    } catch (error) {
      console.error('Error getting file view:', error);
      throw error;
    }
  }

  async getFileDownload(bucketId: string, fileId: string): Promise<URL> {
    try {
      return storage.getFileDownload(bucketId, fileId);
    } catch (error) {
      console.error('Error getting file download:', error);
      throw error;
    }
  }

  /**
   * Convenience: return a direct file URL (alias of getFileView)
   */
  getFileUrl(bucketId: string, fileId: string): URL {
    return storage.getFileView(bucketId, fileId);
  }

  // Bucket-specific helpers
  async uploadMessageAttachment(file: File): Promise<Models.File> {
    return this.uploadFile(BUCKET_IDS.MESSAGES, file);
  }

  async uploadStoryMedia(file: File): Promise<Models.File> {
    return this.uploadFile(BUCKET_IDS.STORIES, file);
  }

  async uploadPostMedia(file: File): Promise<Models.File> {
    return this.uploadFile(BUCKET_IDS.POSTS, file);
  }

  async uploadVoiceMessage(file: File): Promise<Models.File> {
    return this.uploadFile(BUCKET_IDS.VOICE, file);
  }

  async uploadVideo(file: File): Promise<Models.File> {
    return this.uploadFile(BUCKET_IDS.VIDEO, file);
  }

  async uploadDocument(file: File): Promise<Models.File> {
    return this.uploadFile(BUCKET_IDS.DOCUMENTS, file);
  }

  async uploadCoverImage(file: File): Promise<Models.File> {
    return this.uploadFile(BUCKET_IDS.COVERS, file);
  }
}

export const storageService = new StorageService();
