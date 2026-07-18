import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = `${environment.apiUrl}/api/auth`;

  // undefined = ยังไม่โหลด, null = guest, object = login แล้ว
  private user$ = new BehaviorSubject<any>(undefined);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUser();
  }

  private loadUser() {
    this.http.get(`${this.API}/me`, { withCredentials: true }).subscribe({
      next: (user) => this.user$.next(user),
      error: () => this.user$.next(null)  // null = guest ไม่ได้ login
    });
  }

  getUser(): Observable<any> { return this.user$.asObservable(); }
  isLoggedIn(): boolean { return !!this.user$.value; }
  isGuest(): boolean { return this.user$.value === null; }
  getRole(): string { return this.user$.value?.role ?? ''; }

  // ✅ เช็ค login ก่อนทำอะไร — ถ้า guest redirect ไป /login?returnUrl=...
  requireLogin(returnUrl = '/'): boolean {
    if (this.isLoggedIn()) return true;
    this.router.navigate(['/login'], { queryParams: { returnUrl } });
    return false;
  }

  register(data: { username: string; password: string; email: string; fullname: string }): Observable<any> {
    return this.http.post(`${this.API}/register`, data, { withCredentials: true });
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.API}/login`, credentials, { withCredentials: true }).pipe(
      tap((user) => this.user$.next(user))
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.user$.next(null))
    );
  }
}
