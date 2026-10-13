export interface ImageProcessResult {
  blob: Blob;
  dataUrl: string;
  originalSize: number;
  newSize: number;
  reductionPercentage: number;
  width: number;
  height: number;
  format: string;
}

export class ImageEngine {
  /**
   * Compress image with quality slider and format option
   */
  public static async compressImage(
    file: File,
    quality: number = 0.75, // 0.1 to 1.0
    outputFormat: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
  ): Promise<ImageProcessResult> {
    const originalSize = file.size;
    const img = await this.loadImage(file);

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context initialization failed.');

    // Solid white background for JPEG
    if (outputFormat === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Image encoding failed.'));
        },
        outputFormat,
        quality
      );
    });

    const newSize = blob.size;
    const reductionPercentage = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));
    const dataUrl = canvas.toDataURL(outputFormat, quality);

    return {
      blob,
      dataUrl,
      originalSize,
      newSize,
      reductionPercentage,
      width: img.naturalWidth,
      height: img.naturalHeight,
      format: outputFormat.split('/')[1]
    };
  }

  /**
   * Resize image to custom dimensions with optional aspect ratio preservation
   */
  public static async resizeImage(
    file: File,
    targetWidth: number,
    targetHeight: number,
    outputFormat: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
    quality: number = 0.9
  ): Promise<ImageProcessResult> {
    const originalSize = file.size;
    const img = await this.loadImage(file);

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(targetWidth));
    canvas.height = Math.max(1, Math.round(targetHeight));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context initialization failed.');

    if (outputFormat === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // High quality bicubic image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Image resizing encoding failed.'));
        },
        outputFormat,
        quality
      );
    });

    const newSize = blob.size;
    const reductionPercentage = Math.round(((originalSize - newSize) / originalSize) * 100);
    const dataUrl = canvas.toDataURL(outputFormat, quality);

    return {
      blob,
      dataUrl,
      originalSize,
      newSize,
      reductionPercentage,
      width: canvas.width,
      height: canvas.height,
      format: outputFormat.split('/')[1]
    };
  }

  /**
   * Format converter between JPG, PNG, and WebP
   */
  public static async convertFormat(
    file: File,
    targetMime: 'image/jpeg' | 'image/png' | 'image/webp',
    quality: number = 0.92
  ): Promise<ImageProcessResult> {
    return this.compressImage(file, quality, targetMime);
  }

  /**
   * Helper to load an image file into an HTMLImageElement
   */
  public static loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Failed to load image file "${file.name}". Ensure the file is not corrupted.`));
      };
      img.src = url;
    });
  }
}
