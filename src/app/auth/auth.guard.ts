import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take, filter } from 'rxjs/operators';

// ✅ Guard สำหรับหน้าที่ต้อง login (checkout, profile, receipt)
export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.getUser().pipe(
    filter(user => user !== undefined),
    take(1),
    map(user => {
      if (user) return true;
      // เก็บ path เต็มสำหรับ redirect กลับหลัง login
      const returnUrl = '/' + route.url.map(s => s.path).join('/');
      router.navigate(['/login'], { queryParams: { returnUrl } });
      return false;
    })
  );
};
