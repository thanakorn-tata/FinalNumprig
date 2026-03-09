import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { CartService } from '../cart/cart.service';
import { CartComponent } from '../cart/cart.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, CartComponent],
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnInit {

  username = '';
  role = '';
  cartCount = 0;
  isCartOpen = false;
  isLoggedIn = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.auth.getUser().subscribe((user: any) => {
      this.isLoggedIn = !!user;
      this.username = user?.username ?? '';
      this.role = user?.role ?? '';
    });

    this.cartService.getCartCount().subscribe(count => {
      this.cartCount = count;
    });
  }

  get isAdmin(): boolean { return this.role === 'ADMIN'; }

  // ✅ กด cart icon — ถ้า guest ให้ไป login
  openCart() {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/' } });
      return;
    }
    this.isCartOpen = true;
  }

  closeCart() { this.isCartOpen = false; }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
