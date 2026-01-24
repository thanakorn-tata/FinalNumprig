import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [

  // 🔓 ไม่ต้อง login
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./homepage/homepage.component')
            .then(m => m.HomepageComponent)
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./product/product-management/product-management.component')
            .then(m => m.ProductManagementComponent)
      }

      // 👉 เพิ่มหน้าอื่นใน layout ได้ตรงนี้
      // {
      //   path: 'products',
      //   loadComponent: () =>
      //     import('./product/product.component')
      //       .then(m => m.ProductComponent)
      // }
    ]
  }
];
