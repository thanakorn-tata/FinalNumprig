import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private API = `${environment.apiUrl}/api/products`;

  constructor(private http: HttpClient) {}

  // ✅ สำหรับ admin — ดึงทั้งหมด (active + inactive)
  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.API, { withCredentials: true });
  }

  // ✅ สำหรับหน้าร้าน — ดึงเฉพาะ active ไม่ต้องพึ่ง session
  getAllActive(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API}/active`, { withCredentials: true });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API}/${id}`, { withCredentials: true });
  }

  add(data: Partial<Product>, imageFile?: File): Observable<Product> {
    return this.http.post<Product>(this.API, this.buildFormData(data, imageFile), { withCredentials: true });
  }

  update(data: Product, imageFile?: File): Observable<Product> {
    return this.http.put<Product>(`${this.API}/${data.id}`, this.buildFormData(data, imageFile), { withCredentials: true });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`, { withCredentials: true });
  }

  toggleActive(id: number): Observable<any> {
    return this.http.patch(`${this.API}/${id}/toggle-active`, {}, { withCredentials: true });
  }

  private buildFormData(data: Partial<Product>, imageFile?: File): FormData {
    const form = new FormData();
    if (data.name)          form.append('name', data.name);
    if (data.description)   form.append('description', data.description);
    if (data.price != null) form.append('price', String(data.price));
    if (data.category)      form.append('category', data.category);
    if (data.stock != null) form.append('stock', String(data.stock));
    if (imageFile)          form.append('image', imageFile);
    return form;
  }
}
