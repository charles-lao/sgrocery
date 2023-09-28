import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  private fileToBase64(file: Express.Multer.File) {
    const base64 = Buffer.from(file.buffer).toString('base64');
    return 'data:' + file.mimetype + ';base64,' + base64;
  }

  async uploadImage(image: Express.Multer.File) {
    const base64Image = this.fileToBase64(image);
    return await cloudinary.uploader.upload(base64Image, {
      resource_type: 'auto',
    });
  }
}
