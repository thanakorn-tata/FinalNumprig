import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private API = 'http://localhost:8080/api/auth';

  // undefined = ยังไม่โหลด, null = ไม่ได้ login, object = login แล้ว
  private user$ = new BehaviorSubject<any>(undefined);

  constructor(private http: HttpClient) {
    this.loadUser();
  }

  private loadUser() {
    this.http.get(`${this.API}/me`, { withCredentials: true }).subscribe({
      next: (user) => this.user$.next(user),
      error: () => this.user$.next(null)
    });
  }

  getUser(): Observable<any> {
    return this.user$.asObservable();
  }

  isLoggedIn(): boolean {
    return !!this.user$.value;
  }

  getRole(): string {
    return this.user$.value?.role ?? '';
  }

  register(data: {
    username: string;
    password: string;
    email: string;
    fullname: string;
  }): Observable<any> {
    return this.http.post(`${this.API}/register`, data, { withCredentials: true });
  }

  // ✅ เพิ่ม tap() อัปเดต user$ หลัง login สำเร็จ
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
