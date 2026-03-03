import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './auth/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
  },

  // ===== User Routes =====
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./homepage/homepage.component').then(m => m.HomepageComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'checkout',    // ✅ หน้าชำระเงิน
        loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent)
      },
      {
        path: 'receipt/:id', // ✅ ใบเสร็จ
        loadComponent: () => import('./receipt/receipt.component').then(m => m.ReceiptComponent)
      }
    ]
  },

  // ===== Admin Routes =====
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./product/product-management/product-management.component').then(m => m.ProductManagementComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./admin/admin-reports/admin-reports.component').then(m => m.AdminReportsComponent)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
