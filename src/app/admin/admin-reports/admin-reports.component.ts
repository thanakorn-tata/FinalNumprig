import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reports.component.html'
})
export class AdminReportsComponent implements OnInit {

  private API = 'http://localhost:8080/api/orders';

  orders: any[] = [];
  filteredOrders: any[] = [];
  selectedStatus = '';
  isLoading = true;

  selectedOrder: any = null;
  showSlipModal = false;
  slipUrl = '';
  isConfirming = false;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  toastVisible = false;

  statusOptions = [
    { value: '', label: 'ทั้งหมด' },
    { value: 'PENDING_PAYMENT', label: 'รอชำระ' },
    { value: 'SLIP_UPLOADED', label: 'รอตรวจสลิป' },
    { value: 'CONFIRMED', label: 'ยืนยันแล้ว' },
    { value: 'CANCELLED', label: 'ยกเลิก' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadOrders(); }

  loadOrders() {
    this.isLoading = true;
    const params = this.selectedStatus ? `?status=${this.selectedStatus}` : '';
    this.http.get<any[]>(`${this.API}/admin${params}`, { withCredentials: true }).subscribe({
      next: (data) => {
        this.orders = data;
        this.filteredOrders = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  filterByStatus() { this.loadOrders(); }

  // ✅ เปิด modal ดูสลิป
  viewSlip(order: any) {
    this.selectedOrder = order;
    this.slipUrl = `${this.API}/${order.id}/slip`;
    this.showSlipModal = true;
  }

  closeSlipModal() {
    this.showSlipModal = false;
    this.selectedOrder = null;
  }

  // ✅ ยืนยัน Order
  confirmOrder(order: any) {
    this.isConfirming = true;
    this.http.patch(`${this.API}/${order.id}/confirm`, {}, { withCredentials: true }).subscribe({
      next: () => {
        order.status = 'CONFIRMED';
        this.showToast(`ยืนยัน Order #${order.id} สำเร็จ`);
        this.isConfirming = false;
        this.closeSlipModal();
        this.loadOrders();
      },
      error: () => {
        this.showToast('ยืนยันไม่สำเร็จ', 'error');
        this.isConfirming = false;
      }
    });
  }

  getStatusText(status: string): string {
    const map: any = {
      'PENDING_PAYMENT': 'รอชำระ',
      'SLIP_UPLOADED': 'รอตรวจสลิป',
      'CONFIRMED': 'ยืนยันแล้ว',
      'CANCELLED': 'ยกเลิก'
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: any = {
      'PENDING_PAYMENT': 'bg-yellow-100 text-yellow-700',
      'SLIP_UPLOADED': 'bg-blue-100 text-blue-700',
      'CONFIRMED': 'bg-green-100 text-green-700',
      'CANCELLED': 'bg-red-100 text-red-700'
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  }

  get pendingCount() { return this.orders.filter(o => o.status === 'SLIP_UPLOADED').length; }
  get totalRevenue() { return this.orders.filter(o => o.status === 'CONFIRMED').reduce((s, o) => s + o.totalAmount, 0); }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }
}
