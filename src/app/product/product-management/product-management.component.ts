import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../product.service';
import { Product, getImageUrl } from '../product.model';
import { ExportExcelService } from '../export-excel.service';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css']
})
export class ProductManagementComponent implements OnInit {

  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchText = '';
  isLoading = true;

  productForm: Product = this.emptyForm();
  selectedImageFile: File | null = null;
  imagePreviewUrl: string | null = null;

  isEditing = false;
  showModal = false;
  showDeleteModal = false;
  productToDelete: Product | null = null;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  toastVisible = false;
  private toastTimeout: any;

  categories = ['น้ำพริก', 'เครื่องปรุง', 'ของหวาน', 'ของทานเล่น'];
  getImageUrl = getImageUrl;

  constructor(
    private productService: ProductService,
    private exportService: ExportExcelService   // ✅ inject
  ) {}

  ngOnInit() { this.loadProducts(); }

  loadProducts() {
    this.isLoading = true;
    this.productService.getAll().subscribe({
      next: (data: Product[]) => {
        this.products = data;
        this.applySearch();
        this.isLoading = false;
      },
      error: () => {
        this.showToast('โหลดสินค้าไม่สำเร็จ', 'error');
        this.isLoading = false;
      }
    });
  }

  searchProducts() { this.applySearch(); }

  private applySearch() {
    const keyword = this.searchText.trim().toLowerCase();
    this.filteredProducts = keyword
      ? this.products.filter(p =>
          p.name.toLowerCase().includes(keyword) ||
          p.description.toLowerCase().includes(keyword))
      : [...this.products];
  }

  // ✅ Export Excel
  exportExcel() {
    this.exportService.exportProducts(this.filteredProducts);
    this.showToast('Export Excel สำเร็จ!');
  }

  toggleActive(product: Product) {
    this.productService.toggleActive(product.id).subscribe({
      next: (res) => {
        product.active = res.active;
        this.showToast(res.message);
      },
      error: () => this.showToast('เปลี่ยนสถานะไม่สำเร็จ', 'error')
    });
  }

  openAddModal() {
    this.isEditing = false;
    this.productForm = this.emptyForm();
    this.selectedImageFile = null;
    this.imagePreviewUrl = null;
    this.showModal = true;
  }

  openEditModal(product: Product) {
    this.isEditing = true;
    this.productForm = { ...product };
    this.selectedImageFile = null;
    this.imagePreviewUrl = getImageUrl(product.id);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedImageFile = null;
    this.imagePreviewUrl = null;
    this.productForm = this.emptyForm();
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('ไฟล์รูปต้องมีขนาดไม่เกิน 5MB', 'error');
      return;
    }
    this.selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.imagePreviewUrl = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  saveProduct() {
    if (!this.productForm['name'] || !this.productForm['price'] || !this.productForm['category']) {
      this.showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }
    if (this.isEditing) {
      this.productService.update(this.productForm, this.selectedImageFile ?? undefined).subscribe({
        next: () => { this.showToast('แก้ไขสินค้าเรียบร้อย'); this.searchText = ''; this.closeModal(); this.loadProducts(); },
        error: () => this.showToast('แก้ไขสินค้าไม่สำเร็จ', 'error')
      });
    } else {
      if (!this.selectedImageFile) { this.showToast('กรุณาเลือกรูปภาพสินค้า', 'error'); return; }
      this.productService.add(this.productForm, this.selectedImageFile).subscribe({
        next: () => { this.showToast('เพิ่มสินค้าเรียบร้อย'); this.searchText = ''; this.closeModal(); this.loadProducts(); },
        error: () => this.showToast('เพิ่มสินค้าไม่สำเร็จ', 'error')
      });
    }
  }

  confirmDelete(product: Product) { this.productToDelete = product; this.showDeleteModal = true; }
  cancelDelete() { this.showDeleteModal = false; this.productToDelete = null; }

  executeDelete() {
    if (!this.productToDelete) return;
    const name = this.productToDelete.name;
    this.productService.delete(this.productToDelete.id).subscribe({
      next: () => { this.showToast(`ลบ "${name}" แล้ว`); this.searchText = ''; this.showDeleteModal = false; this.productToDelete = null; this.loadProducts(); },
      error: () => this.showToast('ลบสินค้าไม่สำเร็จ', 'error')
    });
  }

  getTotalValue(): number {
    return this.products.reduce((sum, p) => sum + (p.price ?? 0) * (p.stock ?? 0), 0);
  }

  getLowStockCount(): number {
    return this.products.filter(p => (p.stock ?? 0) < 50).length;
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.toastVisible = false, 3000);
  }

  private emptyForm(): Product {
    return { id: 0, name: '', description: '', price: 0, category: '', stock: 0, active: true };
  }
}
