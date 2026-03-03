import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router,  } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule, ],
  templateUrl: './receipt.component.html'
})
export class ReceiptComponent implements OnInit {

  order: any = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get<any>(`http://localhost:8080/api/orders/${id}`, { withCredentials: true }).subscribe({
      next: (order) => {
        this.order = order;
        this.isLoading = false;
      },
      error: () => this.router.navigate(['/'])
    });
  }

  getStatusText(status: string): string {
    const map: any = {
      'PENDING_PAYMENT': 'รอชำระเงิน',
      'SLIP_UPLOADED': 'รอตรวจสอบสลิป',
      'CONFIRMED': 'ยืนยันแล้ว',
      'CANCELLED': 'ยกเลิก'
    };
    return map[status] || status;
  }

  getStatusColor(status: string): string {
    const map: any = {
      'PENDING_PAYMENT': 'bg-yellow-100 text-yellow-700',
      'SLIP_UPLOADED': 'bg-blue-100 text-blue-700',
      'CONFIRMED': 'bg-green-100 text-green-700',
      'CANCELLED': 'bg-red-100 text-red-700'
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  }

  // ✅ Print / Download ใบเสร็จ
  printReceipt() {
    window.print();
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
