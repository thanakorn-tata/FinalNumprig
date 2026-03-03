import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../cart/cart.service';
import { CartItem, CartResponse } from '../cart/cart.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {

  private API = 'http://localhost:8080/api/orders';

  // ขั้นตอน: 1=กรอกข้อมูล, 2=ชำระเงิน, 3=รอยืนยัน
  step = 1;

  cartItems: CartItem[] = [];
  total = 0;
  isLoading = true;

  shippingForm = {
    shippingName: '',
    shippingPhone: '',
    shippingAddress: ''
  };

  orderId: number | null = null;
  selectedSlip: File | null = null;
  slipPreviewUrl: string | null = null;
  isUploadingSlip = false;
  isCreatingOrder = false;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  toastVisible = false;

  // ✅ QR Code คงที่ — เปลี่ยน path ให้ตรงกับไฟล์ที่ upload ไว้ใน assets
  qrCodeUrl = 'assets/qr-payment.png';

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.getCart().subscribe({
      next: (res: CartResponse) => {
        this.cartItems = res.items;
        this.total = res.total;
        this.isLoading = false;
        if (this.cartItems.length === 0) {
          this.router.navigate(['/']);
        }
      },
      error: () => this.isLoading = false
    });
  }

  // ✅ Step 1 → สร้าง order
  proceedToPayment() {
    if (!this.shippingForm.shippingName || !this.shippingForm.shippingPhone || !this.shippingForm.shippingAddress) {
      this.showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }
    this.isCreatingOrder = true;
    this.http.post<any>(this.API, this.shippingForm, { withCredentials: true }).subscribe({
      next: (order) => {
        this.orderId = order.id;
        this.step = 2;
        this.isCreatingOrder = false;
      },
      error: () => {
        this.showToast('สร้าง order ไม่สำเร็จ', 'error');
        this.isCreatingOrder = false;
      }
    });
  }

  // ✅ เลือกไฟล์สลิป
  onSlipSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('ไฟล์ต้องไม่เกิน 5MB', 'error');
      return;
    }
    this.selectedSlip = file;
    const reader = new FileReader();
    reader.onload = (e) => this.slipPreviewUrl = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  // ✅ Upload slip
  uploadSlip() {
    if (!this.selectedSlip || !this.orderId) {
      this.showToast('กรุณาเลือกรูปสลิป', 'error');
      return;
    }
    this.isUploadingSlip = true;
    const form = new FormData();
    form.append('slip', this.selectedSlip);

    this.http.post(`${this.API}/${this.orderId}/slip`, form, { withCredentials: true }).subscribe({
      next: () => {
        this.step = 3;
        this.isUploadingSlip = false;
        this.cartService.refreshCount();
      },
      error: () => {
        this.showToast('อัปโหลดสลิปไม่สำเร็จ', 'error');
        this.isUploadingSlip = false;
      }
    });
  }

  goToReceipt() {
    this.router.navigate(['/receipt', this.orderId]);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }
}
