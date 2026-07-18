import { environment } from '../../environments/environment';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageType?: string;
  active?: boolean;  // ✅ เพิ่ม active
}

export function getImageUrl(id: number): string {
  return `${environment.apiUrl}/api/products/${id}/image`;
}
