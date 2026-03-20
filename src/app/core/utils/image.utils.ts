import { environment } from '../../../environments/environment';

export function getImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  return `${environment.apiUrl}${imagePath}`;
}
