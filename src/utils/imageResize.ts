/**
 * Resize an image file to a max dimension and return a base64 data URL.
 * Keeps the photo small enough for localStorage (~60–80 KB target).
 */
export function resizeImageToDataUrl(
  file: File,
  maxDimension = 800,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        const { width, height } = img;
        let newW = width;
        let newH = height;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            newW = maxDimension;
            newH = Math.round(height * (maxDimension / width));
          } else {
            newH = maxDimension;
            newW = Math.round(width * (maxDimension / height));
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = newW;
        canvas.height = newH;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }
        ctx.drawImage(img, 0, 0, newW, newH);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
