import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt.component.html',
})
export class ReceiptComponent implements OnInit {
  order: any = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.http
      .get<any>(`${environment.apiUrl}/api/orders/${id}`, {
        withCredentials: true,
      })
      .subscribe({
        next: (order) => {
          this.order = order;
          this.isLoading = false;
        },
        error: () => this.router.navigate(['/']),
      });
  }

  getStatusText(status: string): string {
    const map: any = {
      PENDING_PAYMENT: 'รอชำระเงิน',
      SLIP_UPLOADED: 'รอตรวจสอบสลิป',
      CONFIRMED: 'ยืนยันแล้ว',
      CANCELLED: 'ยกเลิก',
    };
    return map[status] || status;
  }

  getStatusColor(status: string): string {
    const map: any = {
      PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700',
      SLIP_UPLOADED: 'bg-blue-100 text-blue-700',
      CONFIRMED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  }

  formatOrderId(id: number): string {
    return String(id).padStart(5, '0');
  }

  // ✅ เปิด popup window print เหมือนหน้า report — ไม่ติด layout เว็บ
  printReceipt() {
    if (!this.order) return;
    const o = this.order;

    const itemRows = (o.items || [])
      .map(
        (item: any, i: number) => `
      <tr>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">${i + 1}</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee;">${item.productName}</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">${item.quantity}</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:center;">ชิ้น</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:right;">${item.productPrice.toFixed(2)}</td>
        <td style="padding:8px 10px; border-bottom:1px solid #eee; text-align:right;">${item.subtotal.toFixed(2)}</td>
      </tr>
    `,
      )
      .join('');

    const confirmedBadge =
      o.status === 'CONFIRMED'
        ? `<div style="text-align:center; margin-top:20px;">
           <div style="display:inline-block; border:2px solid #16a34a; border-radius:8px; padding:8px 24px; color:#16a34a; font-weight:bold; font-size:15px;">
             ✓ ชำระเงินเรียบร้อยแล้ว
           </div>
         </div>`
        : '';

    const createdDate = new Date(o.createdAt).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const confirmedDate = o.confirmedAt
      ? new Date(o.confirmedAt).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '-';

    const html = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>ใบเสร็จ #${this.formatOrderId(o.id)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Sarabun', Arial, sans-serif; font-size: 13px; color: #222; background: white; padding: 30px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .company-name { font-size: 22px; font-weight: bold; color: #c0392b; }
    .company-sub { font-size: 14px; color: #555; margin-top: 2px; }
    .company-info { font-size: 11px; color: #777; margin-top: 6px; line-height: 1.6; }
    .doc-title { text-align: center; margin: 16px 0; }
    .doc-title-box { display: inline-block; border: 2px solid #e05c1a; border-radius: 6px; padding: 6px 40px; font-size: 18px; font-weight: bold; color: #e05c1a; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .info-table td { padding: 5px 8px; font-size: 12px; vertical-align: top; }
    .info-table .label { color: #888; width: 80px; }
    .info-right { border: 1px solid #ddd; border-radius: 4px; padding: 8px 12px; font-size: 12px; }
    .info-right table { width: 100%; }
    .info-right td { padding: 3px 6px; }
    .info-right .lbl { color: #888; width: 70px; }
    .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .items-table th { background: #f5f5f5; border-top: 2px solid #333; border-bottom: 1px solid #aaa; padding: 8px 10px; font-size: 12px; }
    .items-table td { font-size: 12px; }
    .items-table tfoot td { border-top: 1px solid #ccc; padding: 6px 10px; font-size: 12px; }
    .items-table tfoot tr.total-row td { border-top: 2px solid #333; font-weight: bold; font-size: 13px; }
    .footer-note { margin-top: 20px; font-size: 11px; color: #777; line-height: 1.8; }
    .sign-box { text-align: center; margin-top: 10px; }
    .sign-line { width: 160px; border-top: 1px solid #333; margin: 40px auto 4px; }
    @page { margin: 15mm 20mm; size: A4 portrait; }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div>
      <div class="company-name">น้ำพริกลูกทุ่งสุพรรณ</div>
      <div class="company-sub">NAMPRIK LUKTHOONG SUPHANBURI</div>
      <div class="company-info">
        123 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพมหานคร 10000<br>
        โทร: 094-999-9999
      </div>
    </div>
    <div class="info-right">
      <table>
        <tr><td class="lbl">เลขที่:</td><td><b>${this.formatOrderId(o.id)}</b></td></tr>
        <tr><td class="lbl">วันที่:</td><td>${createdDate}</td></tr>
        <tr><td class="lbl">ยืนยัน:</td><td>${confirmedDate}</td></tr>
        <tr><td class="lbl">สถานะ:</td><td><b>${this.getStatusText(o.status)}</b></td></tr>
      </table>
    </div>
  </div>

  <!-- Title -->
  <div class="doc-title">
    <div class="doc-title-box">ใบสั่งซื้อ / ใบเสร็จรับเงิน</div>
  </div>

  <!-- Customer Info -->
  <table class="info-table">
    <tr>
      <td class="label">เรียน:</td>
      <td><b>${o.shippingName}</b></td>
    </tr>
    <tr>
      <td class="label">ที่อยู่:</td>
      <td>${o.shippingAddress}</td>
    </tr>
    <tr>
      <td class="label">โทร:</td>
      <td>${o.shippingPhone}</td>
    </tr>
  </table>

  <!-- Items Table -->
  <table class="items-table">
    <thead>
      <tr>
        <th style="text-align:center; width:40px;">ลำดับ</th>
        <th style="text-align:left;">รายการสินค้า</th>
        <th style="text-align:center; width:60px;">จำนวน</th>
        <th style="text-align:center; width:50px;">หน่วย</th>
        <th style="text-align:right; width:90px;">ราคา/หน่วย</th>
        <th style="text-align:right; width:100px;">จำนวนเงิน</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="5" style="text-align:right; padding:8px 10px;">รวมเงิน</td>
        <td style="text-align:right; padding:8px 10px;">${o.totalAmount.toFixed(2)}</td>
      </tr>
      <tr class="total-row">
        <td colspan="5" style="text-align:right; padding:8px 10px;">รวมจำนวนทั้งสิ้น</td>
        <td style="text-align:right; padding:8px 10px; color:#c0392b;">${o.totalAmount.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>

  ${confirmedBadge}

  <!-- Footer -->
  <div style="display:flex; justify-content:space-between; margin-top:30px; align-items:flex-end;">
    <div class="footer-note">
      <b>หมายเหตุ</b><br>
      กำหนดส่งสินค้า: 1-8 วัน (นับจากได้รับใบสั่งซื้อ)<br>
      เงื่อนไขการชำระเงิน: โอนแล้ว<br>
      *** เอกสารนี้ออกโดยระบบอัตโนมัติ ***
    </div>
    <div class="sign-box">
      <div class="sign-line"></div>
      <div style="font-size:12px;">ผู้รับเงิน / Authorized Signature</div>
      <div style="font-size:11px; color:#888; margin-top:2px;">น้ำพริกลูกทุ่งสุพรรณ</div>
    </div>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=850,height=1100');
    win?.document.write(html);
    win?.document.close();
    win?.focus();
    setTimeout(() => {
      win?.print();
    }, 600);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
