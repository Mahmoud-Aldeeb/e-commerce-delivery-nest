import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { UploadController } from './upload.controller';

@Module({
  // CloudinaryModule is not global, so we import it to get CloudinaryService
  imports: [CloudinaryModule],
  controllers: [UploadController],
})
export class UploadModule {}
