import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CartResponse } from './cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private API = 'http://localhost:8080/api/cart';

  // ✅ Cache จำนวนสินค้าในตะกร้า สำหรับแสดงที่ icon
  private cartCount$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {
    this.loadCartCount();
  }

  // ✅ ดึงจำนวนสินค้าครั้งแรกตอน app เริ่ม
  private loadCartCount() {
    this.getCart().subscribe({
      next: (res) => this.cartCount$.next(res.count),
      error: () => this.cartCount$.next(0)
    });
  }

  // ✅ Observable สำหรับ Layout ดึงไปแสดงที่ icon
  getCartCount(): Observable<number> {
    return this.cartCount$.asObservable();
  }

  // ✅ GET ตะกร้า
  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(this.API, { withCredentials: true });
  }

  // ✅ ADD สินค้า
  addToCart(productId: number, quantity: number = 1): Observable<any> {
    return this.http.post(this.API, { productId, quantity }, { withCredentials: true }).pipe(
      tap(() => this.cartCount$.next(this.cartCount$.value + quantity))
    );
  }

  // ✅ UPDATE จำนวน
  updateQuantity(cartId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.API}/${cartId}`, { quantity }, { withCredentials: true });
  }

  // ✅ DELETE รายการ
  removeItem(cartId: number): Observable<any> {
    return this.http.delete(`${this.API}/${cartId}`, { withCredentials: true }).pipe(
      tap(() => this.refreshCount())
    );
  }

  // ✅ CLEAR ทั้งหมด
  clearCart(): Observable<any> {
    return this.http.delete(this.API, { withCredentials: true }).pipe(
      tap(() => this.cartCount$.next(0))
    );
  }

  // ✅ Refresh จำนวนจาก API
  refreshCount() {
    this.getCart().subscribe({
      next: (res) => this.cartCount$.next(res.count),
      error: () => this.cartCount$.next(0)
    });
  }
}
