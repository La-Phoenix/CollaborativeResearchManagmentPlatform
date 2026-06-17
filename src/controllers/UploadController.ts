import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';

export class UploadController {
  /**
   * Handles the file upload and returns the Cloudinary fileUrl
   */
  static async uploadFile(req: AuthRequest, res: Response) {
    try {
      // Cast to any to bypass TS complaining about req.file from Multer
      const multerReq = req as any;
      if (!multerReq.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // Multer-storage-cloudinary attaches the path/url to req.file.path
      const fileUrl = multerReq.file.path;

      res.status(201).json({
        message: 'File uploaded successfully',
        fileUrl: fileUrl,
      });
    } catch (error) {
      console.error('File Upload Error:', error);
      res.status(500).json({ error: 'Failed to upload file to Cloudinary' });
    }
  }
}
