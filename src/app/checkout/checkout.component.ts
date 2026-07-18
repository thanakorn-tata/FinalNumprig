import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { CartService } from "../cart/cart.service";
import { CartItem, CartResponse } from "../cart/cart.model";
import * as QRCode from "qrcode";
import generatePayload from "promptpay-qr";
import { environment } from "../../environments/environment";

interface SavedAddress {
  id: number;
  label: string;
  recipientName: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

@Component({
  selector: "app-checkout",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./checkout.component.html"
})
export class CheckoutComponent implements OnInit {

  private API       = `${environment.apiUrl}/api/orders`;
  private ADDR_API  = `${environment.apiUrl}/api/addresses`;
  private PROMPTPAY_ID = "0937460033";

  step = 1;
  cartItems: CartItem[] = [];
  total = 0;
  isLoading = true;

  shippingForm = { shippingName: "", shippingPhone: "", shippingAddress: "" };

  // ✅ ที่อยู่ที่บันทึกไว้
  savedAddresses: SavedAddress[] = [];
  selectedAddressId: number | null = null;
  showAddressForm = false;   // แสดง form เพิ่มที่อยู่ใหม่
  showAddressPicker = false; // แสดง popup เลือกที่อยู่

  // form เพิ่ม/แก้ไขที่อยู่
  addressForm = { label: "บ้าน", recipientName: "", phone: "", address: "", isDefault: false };
  editingAddressId: number | null = null;
  isSavingAddress = false;

  orderId: number | null = null;
  selectedSlip: File | null = null;
  slipPreviewUrl: string | null = null;
  isUploadingSlip = false;
  isCreatingOrder = false;

  qrCodeUrl = "";
  isGeneratingQR = false;
  toastMessage = "";
  toastType: "success" | "error" = "success";
  toastVisible = false;

  constructor(private http: HttpClient, private cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.cartService.getCart().subscribe({
      next: (res: CartResponse) => {
        this.cartItems = res.items;
        this.total = res.total;
        this.isLoading = false;
        if (this.cartItems.length === 0) this.router.navigate(["/"]);
      },
      error: () => this.isLoading = false
    });

    // ✅ โหลดที่อยู่ที่บันทึกไว้
    this.loadAddresses();
  }

  loadAddresses() {
    this.http.get<SavedAddress[]>(this.ADDR_API, { withCredentials: true }).subscribe({
      next: (list) => {
        this.savedAddresses = list;
        // prefill ด้วย default address
        const def = list.find(a => a.isDefault);
        if (def) {
          this.selectAddress(def);
        }
      },
      error: () => {}
    });
  }

  // ✅ เลือกที่อยู่ไปใส่ form
  selectAddress(addr: SavedAddress) {
    this.selectedAddressId = addr.id;
    this.shippingForm.shippingName    = addr.recipientName;
    this.shippingForm.shippingPhone   = addr.phone;
    this.shippingForm.shippingAddress = addr.address;
    this.showAddressPicker = false;
  }

  // ✅ เปิด form เพิ่มที่อยู่ใหม่
  openAddForm() {
    this.editingAddressId = null;
    this.addressForm = { label: "บ้าน", recipientName: "", phone: "", address: "", isDefault: false };
    this.showAddressForm = true;
  }

  // ✅ เปิด form แก้ไขที่อยู่
  openEditForm(addr: SavedAddress) {
    this.editingAddressId = addr.id;
    this.addressForm = {
      label: addr.label,
      recipientName: addr.recipientName,
      phone: addr.phone,
      address: addr.address,
      isDefault: addr.isDefault
    };
    this.showAddressForm = true;
    this.showAddressPicker = false;
  }

  // ✅ บันทึกที่อยู่ (เพิ่ม/แก้ไข)
  saveAddressForm() {
    if (!this.addressForm.recipientName || !this.addressForm.phone || !this.addressForm.address) {
      this.showToast("กรุณากรอกข้อมูลให้ครบ", "error");
      return;
    }
    this.isSavingAddress = true;
    const body = { ...this.addressForm };

    const req = this.editingAddressId
      ? this.http.put<SavedAddress>(`${this.ADDR_API}/${this.editingAddressId}`, body, { withCredentials: true })
      : this.http.post<SavedAddress>(this.ADDR_API, body, { withCredentials: true });

    req.subscribe({
      next: () => {
        this.showToast("บันทึกที่อยู่สำเร็จ");
        this.isSavingAddress = false;
        this.showAddressForm = false;
        this.loadAddresses();
      },
      error: () => { this.showToast("บันทึกไม่สำเร็จ", "error"); this.isSavingAddress = false; }
    });
  }

  // ✅ ลบที่อยู่
  deleteAddress(addr: SavedAddress) {
    if (!confirm(`ลบที่อยู่ "${addr.label}" ใช่ไหม?`)) return;
    this.http.delete(`${this.ADDR_API}/${addr.id}`, { withCredentials: true }).subscribe({
      next: () => { this.showToast("ลบที่อยู่แล้ว"); this.loadAddresses(); },
      error: () => this.showToast("ลบไม่สำเร็จ", "error")
    });
  }

  // ✅ ตั้งเป็น default
  setDefault(addr: SavedAddress) {
    this.http.patch(`${this.ADDR_API}/${addr.id}/default`, {}, { withCredentials: true }).subscribe({
      next: () => { this.showToast("ตั้งเป็นที่อยู่หลักแล้ว"); this.loadAddresses(); },
      error: () => this.showToast("เกิดข้อผิดพลาด", "error")
    });
  }

  get selectedAddress(): SavedAddress | undefined {
    return this.savedAddresses.find(a => a.id === this.selectedAddressId);
  }

  async generateQR(amount: number) {
    this.isGeneratingQR = true;
    try {
      const payload = generatePayload(this.PROMPTPAY_ID, { amount });
      this.qrCodeUrl = await QRCode.toDataURL(payload, {
        width: 250, margin: 2, color: { dark: "#000000", light: "#ffffff" }
      });
    } catch { this.showToast("สร้าง QR Code ไม่สำเร็จ", "error"); }
    this.isGeneratingQR = false;
  }

  proceedToPayment() {
    if (!this.shippingForm.shippingName || !this.shippingForm.shippingPhone || !this.shippingForm.shippingAddress) {
      this.showToast("กรุณากรอกข้อมูลให้ครบถ้วน", "error"); return;
    }
    this.isCreatingOrder = true;
    this.http.post<any>(this.API, this.shippingForm, { withCredentials: true }).subscribe({
      next: (order) => {
        this.orderId = order.id;
        this.generateQR(this.total);
        this.cartService.refreshCount();
        this.step = 2;
        this.isCreatingOrder = false;
      },
      error: () => { this.showToast("สร้าง order ไม่สำเร็จ", "error"); this.isCreatingOrder = false; }
    });
  }

  onSlipSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) { this.showToast("ไฟล์ต้องไม่เกิน 5MB", "error"); return; }
    this.selectedSlip = file;
    const reader = new FileReader();
    reader.onload = (e) => this.slipPreviewUrl = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  uploadSlip() {
    if (!this.selectedSlip || !this.orderId) { this.showToast("กรุณาเลือกรูปสลิป", "error"); return; }
    this.isUploadingSlip = true;
    const form = new FormData();
    form.append("slip", this.selectedSlip);
    this.http.post(`${this.API}/${this.orderId}/slip`, form, { withCredentials: true }).subscribe({
      next: () => { this.step = 3; this.isUploadingSlip = false; this.cartService.refreshCount(); },
      error: () => { this.showToast("อัปโหลดสลิปไม่สำเร็จ", "error"); this.isUploadingSlip = false; }
    });
  }

  goToReceipt() { this.router.navigate(["/receipt", this.orderId]); }
  goHome() { this.router.navigate(["/"]); }

  showToast(message: string, type: "success" | "error" = "success") {
    this.toastMessage = message; this.toastType = type; this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }
}
