import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as moment from 'moment';
import { join } from 'path';

export class FileValidation {
  static fileInterceptor(fieldName: string) {
    return FileInterceptor(fieldName);
  }

  static validateFileOptions(options: {
    fileType?: RegExp;
    maxSize?: number;
    fileIsRequired?: boolean;
  }) {
    return new ParseFilePipeBuilder()
      .addFileTypeValidator({
        fileType: options.fileType || /(jpg|jpeg|png|gif)$/,
      })
      .addMaxSizeValidator({
        maxSize: options.maxSize || 20 * 1024 * 1024,
      })
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        fileIsRequired: options.fileIsRequired || false,
      });
  }

  //TODO: Handling and saving files in the Cloud or Server
  static saveFile(file?: Express.Multer.File) {
    const uploadPath = join(__dirname, '../../uploads');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    const timeNow = moment().format('YYYYMMDDHHmmssSSS');
    const fileName = `${timeNow}_${file.originalname}`;
    const filePath = join(uploadPath, fileName);
    writeFileSync(filePath, file.buffer);
    return fileName;
  }
}
