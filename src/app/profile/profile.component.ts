import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {

  private API = 'http://localhost:8080/api/users';

  profileForm = {
    username: '',
    email: '',
    fullname: ''
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  isLoading = true;
  isSavingProfile = false;
  isSavingPassword = false;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  toastVisible = false;
  private toastTimeout: any;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  ngOnInit() {
    // ✅ ดึงข้อมูลจาก AuthService ที่โหลดไว้แล้ว ไม่ต้องเรียก API ซ้ำ
    this.auth.getUser().pipe(
      filter(user => user !== null && user !== undefined),
      take(1)
    ).subscribe(user => {
      this.profileForm.username = user.username ?? '';
      this.profileForm.email = user.email ?? '';
      this.profileForm.fullname = user.fullname ?? '';
      this.isLoading = false;
    });
  }

  // ✅ บันทึกข้อมูลส่วนตัว
  saveProfile() {
    this.isSavingProfile = true;
    this.http.put(`${this.API}/me`, {
      email: this.profileForm.email,
      fullname: this.profileForm.fullname
    }, { withCredentials: true }).subscribe({
      next: () => {
        this.showToast('อัปเดตข้อมูลสำเร็จ');
        this.isSavingProfile = false;
      },
      error: (err: any) => {
        this.showToast(err.error || 'อัปเดตไม่สำเร็จ', 'error');
        this.isSavingProfile = false;
      }
    });
  }

  // ✅ เปลี่ยนรหัสผ่าน
  savePassword() {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.showToast('รหัสผ่านใหม่ไม่ตรงกัน', 'error');
      return;
    }
    if (this.passwordForm.newPassword.length < 8) {
      this.showToast('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร', 'error');
      return;
    }

    this.isSavingPassword = true;
    this.http.put(`${this.API}/me`, {
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }, { withCredentials: true }).subscribe({
      next: () => {
        this.showToast('เปลี่ยนรหัสผ่านสำเร็จ');
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.isSavingPassword = false;
      },
      error: (err: any) => {
        this.showToast(err.error || 'เปลี่ยนรหัสผ่านไม่สำเร็จ', 'error');
        this.isSavingPassword = false;
      }
    });
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.toastVisible = false, 3000);
  }
}
