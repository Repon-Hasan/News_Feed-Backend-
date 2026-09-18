import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private isConfigured = false;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.isConfigured = true;
      this.logger.log('Cloudinary initialized');
    } else {
      this.logger.warn('Cloudinary credentials missing in .env. Using fallback image service.');
    }
  }

  async uploadImage(base64Data: string, folder = 'news_articles'): Promise<{ url: string; publicId?: string }> {
    if (!base64Data) {
      throw new BadRequestException('ছবির ডাটা পাওয়া যায়নি (Image data required)');
    }

    // Validate base64 image
    const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) {
      // If it's already an http/https URL, return directly
      if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
        return { url: base64Data };
      }
      throw new BadRequestException('অবৈধ ছবির ফরম্যাট (Invalid base64 image data)');
    }

    const imageType = matches[1].toLowerCase();
    const allowedTypes = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
    if (!allowedTypes.includes(imageType)) {
      throw new BadRequestException('শুধুমাত্র JPG, PNG, WEBP ও GIF সমর্থিত');
    }

    // Check size approximately (base64 length * 0.75 gives byte size)
    const approximateBytes = matches[2].length * 0.75;
    if (approximateBytes > 5 * 1024 * 1024) {
      throw new BadRequestException('ছবির সর্বোচ্চ আকার ৫ মেগাবাইট (Max 5MB)');
    }

    if (this.isConfigured) {
      try {
        const uploadResult = await cloudinary.uploader.upload(base64Data, {
          folder,
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 1200, crop: 'limit' },
          ],
        });

        return {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        };
      } catch (error) {
        this.logger.error(`Cloudinary upload failed: ${error.message}`);
        throw new BadRequestException(`ছবি আপলোড ব্যর্থ হয়েছে: ${error.message}`);
      }
    }

    // In local dev without Cloudinary keys, we return an optimized SVG/Unsplash mock or data URI
    return {
      url: `https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200&auto=format&fit=crop`,
    };
  }
}
