import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take, filter } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.getUser().pipe(
    // ✅ รอจนกว่า user จะถูก load แล้ว (ไม่ใช่ undefined)
    filter(user => user !== undefined),
    take(1),
    map(user => {
      if (user) return true;
      router.navigate(['/login']);
      return false;
    })
  );
};
