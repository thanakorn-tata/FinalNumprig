import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take, filter } from 'rxjs/operators';

export const AdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.getUser().pipe(
    // ✅ รอจนกว่า user จะถูก load แล้ว
    filter(user => user !== undefined),
    take(1),
    map(user => {
      if (user && (user as any).role === 'ADMIN') return true;
      router.navigate([user ? '/' : '/login']);
      return false;
    })
  );
};
