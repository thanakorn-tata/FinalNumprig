import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  // เอา LayoutComponent คลุมไว้แล้ว เติม path ข้างล่างต่อได้เลย เช็ค import ให้ดี
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./homepage/homepage.component')
            .then(m => m.HomepageComponent)
      }
    ]
  }
];
