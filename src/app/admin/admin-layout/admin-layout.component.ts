import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent implements OnInit {

  username = '';
  isSidebarCollapsed = false;

  menuItems = [
    { label: 'Dashboard',        icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'จัดการ User',      icon: 'users',     route: '/admin/users'     }, // ✅ ย้ายขึ้นมา
    { label: 'จัดการสินค้า',    icon: 'products',  route: '/admin/products'  },
    { label: 'รายงาน / Report', icon: 'report',    route: '/admin/reports'   }
  ];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.getUser().subscribe((user: any) => {
      this.username = user?.username ?? '';
    });
  }

  toggleSidebar() { this.isSidebarCollapsed = !this.isSidebarCollapsed; }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }

  goToShop() { this.router.navigate(['/']); }
}
