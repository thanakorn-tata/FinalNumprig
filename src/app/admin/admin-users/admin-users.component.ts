import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface UserItem {
  id: number;
  username: string;
  email: string;
  fullname: string;
  role: string;
  active: boolean;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent implements OnInit {

  users: UserItem[] = [];
  filteredUsers: UserItem[] = [];
  searchText = '';
  isLoading = true;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  toastVisible = false;
  private toastTimeout: any;

  private API = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.isLoading = true;
    this.http.get<UserItem[]>(this.API, { withCredentials: true }).subscribe({
      next: (data) => {
        this.users = data;
        this.applySearch();
        this.isLoading = false;
      },
      error: () => {
        this.showToast('โหลดข้อมูล user ไม่สำเร็จ', 'error');
        this.isLoading = false;
      }
    });
  }

  searchUsers() { this.applySearch(); }

  private applySearch() {
    const keyword = this.searchText.trim().toLowerCase();
    this.filteredUsers = keyword
      ? this.users.filter(u =>
          u.username.toLowerCase().includes(keyword) ||
          u.email.toLowerCase().includes(keyword) ||
          u.fullname.toLowerCase().includes(keyword))
      : [...this.users];
  }

  // ✅ Toggle ban/unban
  toggleActive(user: UserItem) {
    this.http.patch(`${this.API}/${user.id}/toggle-active`, {}, { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          user.active = res.active;
          this.showToast(res.message);
        },
        error: () => this.showToast('เปลี่ยนสถานะไม่สำเร็จ', 'error')
      });
  }

  // ✅ เปลี่ยน role
  changeRole(user: UserItem, newRole: string) {
    this.http.patch(`${this.API}/${user.id}/role`, { role: newRole }, { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          user.role = res.role;
          this.showToast(res.message);
        },
        error: () => this.showToast('เปลี่ยน role ไม่สำเร็จ', 'error')
      });
  }

  get totalUsers() { return this.users.length; }
  get activeUsers() { return this.users.filter(u => u.active).length; }
  get adminCount() { return this.users.filter(u => u.role === 'ADMIN').length; }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.toastVisible = false, 3000);
  }
}
