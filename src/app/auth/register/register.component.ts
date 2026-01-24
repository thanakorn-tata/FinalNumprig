import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {

  form = {
    username: '',
    password: '',
    email: '',
    fullname: ''
  };

  error = '';
  success = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  submit() {
    this.error = '';
    this.success = '';

    this.auth.register(this.form).subscribe({
      next: () => {
        this.success = 'สมัครสมาชิกสำเร็จ 🎉';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.error = err.error || 'สมัครสมาชิกไม่สำเร็จ';
      }
    });
  }
}
