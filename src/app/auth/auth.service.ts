import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  // ✅ login
  login(data: { username: string; password: string }): Observable<any> {
    return this.http.post(
      `${this.API}/login`,
      data,
      { withCredentials: true }
    );
  }

  // ✅ register
  register(data: {
    username: string;
    password: string;
    email: string;
    fullname: string;
  }): Observable<any> {
    return this.http.post(
      `${this.API}/register`,
      data,
      { withCredentials: true }
    );
  }

  // ✅ me (ใช้เช็ค session)
  me(): Observable<any> {
    return this.http.get(
      `${this.API}/me`,
      { withCredentials: true }
    );
  }

  // ✅ logout
  logout(): Observable<any> {
    return this.http.post(
      `${this.API}/logout`,
      {},
      { withCredentials: true }
    );
  }
}
