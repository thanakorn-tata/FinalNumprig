import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../product/product.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {

  totalProducts = 0;
  totalUsers = 0;
  lowStockCount = 0;
  totalValue = 0;

  isLoading = true;

  constructor(
    private productService: ProductService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // ✅ ดึงข้อมูลสินค้า
    this.productService.getAll().subscribe({
      next: (products) => {
        this.totalProducts = products.length;
        this.lowStockCount = products.filter(p => (p.stock ?? 0) < 50).length;
        this.totalValue = products.reduce((sum, p) => sum + (p.price ?? 0) * (p.stock ?? 0), 0);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });

    // ✅ ดึงจำนวน users
    this.http.get<any[]>('http://localhost:8080/api/users', { withCredentials: true }).subscribe({
      next: (users) => this.totalUsers = users.length,
      error: () => this.totalUsers = 0
    });
  }
}
