import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from './cart.service';
import { CartItem, CartResponse } from './cart.model';
import { Router } from '@angular/router';

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

  constructor(
    private cartService: CartService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  ngOnChanges() {
    if (this.isOpen) this.loadCart();
  }

  loadCart() {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: (res: CartResponse) => {
        this.items = res.items;
        this.total = res.total;
        this.isLoading = false;
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

  // ✅ ไปหน้า checkout
  goToCheckout() {
    this.close();
    this.router.navigate(['/checkout']);
  }

  private calcTotal() {
    this.total = this.items.reduce((sum, i) => sum + i.subtotal, 0);
  }

  close() {
    this.closeCart.emit();
  }
}
