import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from './cart.service';
import { CartItem, CartResponse } from './cart.model';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closeCart = new EventEmitter<void>();

  items: CartItem[] = [];
  total = 0;
  isLoading = true;

  // ✅ pending order ที่ยังไม่ได้ชำระ
  pendingOrderId: number | null = null;

  constructor(
    private cartService: CartService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() { this.loadCart(); }

  ngOnChanges() { if (this.isOpen) this.loadCart(); }

  loadCart() {
    this.isLoading = true;
    this.pendingOrderId = null;

    // โหลด cart และเช็ค pending order พร้อมกัน
    this.cartService.getCart().subscribe({
      next: (res: CartResponse) => {
        this.items = res.items;
        this.total = res.total;
        this.isLoading = false;

        // ✅ ถ้าตะกร้าว่าง ให้เช็คว่ามี pending order ค้างไหม
        if (this.items.length === 0) {
          this.http.get<any[]>('http://localhost:8080/api/orders/my', { withCredentials: true }).subscribe({
            next: (orders) => {
              const pending = orders.find(o => o.status === 'PENDING_PAYMENT');
              this.pendingOrderId = pending?.id ?? null;
            },
            error: () => {}
          });
        }
      },
      error: () => (this.isLoading = false),
    });
  }

  increase(item: CartItem) {
    this.cartService.updateQuantity(item.cartId, item.quantity + 1).subscribe(() => {
      item.quantity++;
      item.subtotal = item.productPrice * item.quantity;
      this.calcTotal();
      this.cartService.refreshCount();
    });
  }

  decrease(item: CartItem) {
    if (item.quantity <= 1) { this.remove(item); return; }
    this.cartService.updateQuantity(item.cartId, item.quantity - 1).subscribe(() => {
      item.quantity--;
      item.subtotal = item.productPrice * item.quantity;
      this.calcTotal();
      this.cartService.refreshCount();
    });
  }

  remove(item: CartItem) {
    this.cartService.removeItem(item.cartId).subscribe(() => {
      this.items = this.items.filter((i) => i.cartId !== item.cartId);
      this.calcTotal();
      this.cartService.refreshCount();
    });
  }

  clearAll() {
    this.cartService.clearCart().subscribe(() => {
      this.items = [];
      this.total = 0;
      this.cartService.refreshCount();
    });
  }

  goToCheckout() {
    this.close();
    this.router.navigate(['/checkout']);
  }

  // ✅ กลับไปชำระ pending order
  continuePendingOrder() {
    this.close();
    this.router.navigate(['/checkout']);
  }

  private calcTotal() {
    this.total = this.items.reduce((sum, i) => sum + i.subtotal, 0);
  }

  close() { this.closeCart.emit(); }
}
