import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, FormsModule, RouterLink]
})
export class LoginComponent implements OnInit {

  form = { username: '', password: '' };
  error = '';
  private returnUrl = '/';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute   // ✅ รับ returnUrl
  ) {}

  ngOnInit() {
    // ✅ ดึง returnUrl จาก query param เช่น /login?returnUrl=/checkout
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
  }

  submit() {
    this.auth.login(this.form).subscribe({
      next: () => {
        // ✅ redirect กลับหน้าเดิมที่พยายามเข้า
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.error = err.error || 'เข้าสู่ระบบไม่สำเร็จ';
      }
    });
  }
}
