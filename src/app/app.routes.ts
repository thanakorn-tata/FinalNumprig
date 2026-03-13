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

  // ===== User Routes — ไม่มี AuthGuard ที่ layout แล้ว (guest เข้าได้) =====
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: '',  // ✅ guest เข้าได้
        loadComponent: () => import('./homepage/homepage.component').then(m => m.HomepageComponent)
      },
      {
        path: 'profile',
        canActivate: [AuthGuard],  // ✅ ต้อง login
        loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'checkout',
        canActivate: [AuthGuard],  // ✅ ต้อง login
        loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent)
      },
      {
        path: 'receipt/:id',
        canActivate: [AuthGuard],  // ✅ ต้อง login
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
  {
  path: 'about',
  loadComponent: () => import('./about/about/about.component').then(m => m.AboutComponent)
},

  { path: '**', redirectTo: '' }
];
