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

  // ✅ Date filter
  dateFrom = '';
  dateTo = '';

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
    this.http.get<any[]>(`${this.API}/admin`, { withCredentials: true }).subscribe({
      next: (data) => {
        this.orders = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  applyFilter() {
    let result = [...this.orders];

    if (this.selectedStatus) {
      result = result.filter(o => o.status === this.selectedStatus);
    }
    if (this.dateFrom) {
      const from = new Date(this.dateFrom); from.setHours(0,0,0,0);
      result = result.filter(o => new Date(o.createdAt) >= from);
    }
    if (this.dateTo) {
      const to = new Date(this.dateTo); to.setHours(23,59,59,999);
      result = result.filter(o => new Date(o.createdAt) <= to);
    }

    this.filteredOrders = result;
  }

  filterByStatus() { this.applyFilter(); }
  clearDateFilter() { this.dateFrom = ''; this.dateTo = ''; this.applyFilter(); }

  // ✅ สำหรับ print — เฉพาะ CONFIRMED ในช่วงวันที่
  get printOrders(): any[] {
    return this.filteredOrders.filter(o => o.status === 'CONFIRMED');
  }

  get printTotalRevenue(): number {
    return this.printOrders.reduce((s, o) => s + o.totalAmount, 0);
  }

  get todayStr(): string {
    return new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  get dateRangeStr(): string {
    if (!this.dateFrom && !this.dateTo) return 'ทั้งหมด';
    const from = this.dateFrom ? new Date(this.dateFrom).toLocaleDateString('th-TH') : '';
    const to = this.dateTo ? new Date(this.dateTo).toLocaleDateString('th-TH') : '';
    if (from && to) return `${from} — ${to}`;
    if (from) return `ตั้งแต่ ${from}`;
    return `ถึง ${to}`;
  }

  formatOrderId(id: number): string {
    return String(id).padStart(5, '0');
  }

  printReport() {
  const printContent = document.querySelector('.print-area')?.innerHTML;
  if (!printContent) return;

  const win = window.open('', '_blank', 'width=800,height=600');
  win?.document.write(`
    <html><head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { border-top: 2px solid #333; border-bottom: 1px solid #333; padding: 8px 10px; }
        td { border-bottom: 1px solid #ccc; padding: 6px 10px; vertical-align: top; }
        tfoot td { border-top: 2px solid #333; border-bottom: 2px solid #333; font-weight: bold; }
        .text-center { text-align: center; } .text-right { text-align: right; }
        @page { margin: 10mm; size: A4; }
      </style>
    </head><body>${printContent}</body></html>
  `);
  win?.document.close();
  win?.focus();
  setTimeout(() => { win?.print(); win?.close(); }, 500);
}

  viewSlip(order: any) {
    this.selectedOrder = order;
    this.slipUrl = `${this.API}/${order.id}/slip`;
    this.showSlipModal = true;
  }

  closeSlipModal() { this.showSlipModal = false; this.selectedOrder = null; }

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
      error: () => { this.showToast('ยืนยันไม่สำเร็จ', 'error'); this.isConfirming = false; }
    });
  }

  getStatusText(status: string): string {
    const map: any = { 'PENDING_PAYMENT': 'รอชำระ', 'SLIP_UPLOADED': 'รอตรวจสลิป', 'CONFIRMED': 'ยืนยันแล้ว', 'CANCELLED': 'ยกเลิก' };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: any = { 'PENDING_PAYMENT': 'bg-yellow-100 text-yellow-700', 'SLIP_UPLOADED': 'bg-blue-100 text-blue-700', 'CONFIRMED': 'bg-green-100 text-green-700', 'CANCELLED': 'bg-red-100 text-red-700' };
    return map[status] || 'bg-gray-100 text-gray-700';
  }

  get pendingCount() { return this.orders.filter(o => o.status === 'SLIP_UPLOADED').length; }
  get totalRevenue() { return this.orders.filter(o => o.status === 'CONFIRMED').reduce((s, o) => s + o.totalAmount, 0); }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message; this.toastType = type; this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }
}
