import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';  // เพิ่ม RouterLink ตรงนี้
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, FormsModule, RouterLink]  // เพิ่ม RouterLink ใน imports
})
export class LoginComponent {

  form = {
    username: '',
    password: ''
  };

  error = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  submit() {
    this.auth.login(this.form).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error || 'เข้าสู่ระบบไม่สำเร็จ';
      }
    });
  }
}
