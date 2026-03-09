import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../product/product.service';
import { Product } from '../product/product.model';
import { AuthService } from '../auth/auth.service';
import { CartService } from '../cart/cart.service';
import { getImageUrl } from '../product/product.model';

interface CarouselSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit, OnDestroy {
  searchText = '';
  currentSlide = 0;
  carouselInterval: any;
  isAdmin = false;
  isLoading = true;
  getImageUrl = getImageUrl;
  toastMessage = '';
  toastVisible = false;
  private toastTimeout: any;

  currentPage = 1;
  itemsPerPage = 8;

  // ✅ Product modal
  selectedProduct: Product | null = null;
  isAddingToCart = false;
  modalQty = 1;

  slides: CarouselSlide[] = [
    { id: 1, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1200&h=400&fit=crop', title: 'น้ำพริกแม่บ้าน', subtitle: 'รสชาติต้นตำรับ ส่งตรงจากบ้าน' },
    { id: 2, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1200&h=400&fit=crop', title: 'ลดราคาพิเศษ', subtitle: 'ซื้อ 2 แถม 1 สำหรับทุกรายการ' },
    { id: 3, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop', title: 'ฟรีค่าส่ง', subtitle: 'เมื่อซื้อครบ 300 บาท' }
  ];

  products: Product[] = [];
  filteredProducts: Product[] = [];

  constructor(
    private router: Router,
    private productService: ProductService,
    private auth: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.startCarousel();
    this.auth.getUser().subscribe((user: any) => { this.isAdmin = user?.role === 'ADMIN'; });
    this.productService.getAllActive().subscribe({
      next: (data: Product[]) => { this.products = data; this.filteredProducts = [...data]; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  ngOnDestroy() {
    this.stopCarousel();
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }

  startCarousel() { this.carouselInterval = setInterval(() => this.nextSlide(), 5000); }
  stopCarousel() { if (this.carouselInterval) clearInterval(this.carouselInterval); }
  onCarouselMouseEnter() { this.stopCarousel(); }
  onCarouselMouseLeave() { this.startCarousel(); }
  nextSlide() { this.currentSlide = (this.currentSlide + 1) % this.slides.length; }
  prevSlide() { this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1; }
  goToSlide(index: number) { this.currentSlide = index; }

  searchProducts() {
    const keyword = this.searchText.trim().toLowerCase();
    this.filteredProducts = keyword
      ? this.products.filter(p => p.name.toLowerCase().includes(keyword) || p.description.toLowerCase().includes(keyword))
      : [...this.products];
    this.currentPage = 1;
  }

  get pagedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const cur = this.currentPage;
    let start = Math.max(1, cur - 2);
    let end = Math.min(total, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openProductModal(product: Product) {
    this.selectedProduct = product;
    this.isAddingToCart = false;
    this.modalQty = 1;
  }

  closeProductModal() { this.selectedProduct = null; this.modalQty = 1; }

  increaseQty() {
    if (this.selectedProduct && this.modalQty < this.selectedProduct.stock) this.modalQty++;
  }

  decreaseQty() { if (this.modalQty > 1) this.modalQty--; }

  addToCart(product: Product, closeModal = false) {
    this.isAddingToCart = true;
    // เรียก addToCart หลายครั้งตามจำนวน
    const calls = Array.from({ length: this.modalQty }, () =>
      this.cartService.addToCart(product.id).toPromise()
    );
    Promise.all(calls).then(() => {
      this.showToast(`เพิ่ม "${product.name}" x${this.modalQty} ลงตะกร้าแล้ว! 🛒`);
      this.isAddingToCart = false;
      if (closeModal) this.closeProductModal();
    }).catch((err: any) => {
      if (err?.status === 401) this.showToast('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้า');
      else this.showToast('เพิ่มสินค้าไม่สำเร็จ');
      this.isAddingToCart = false;
    });
  }

  buyNow(product: Product) {
    this.isAddingToCart = true;
    const calls = Array.from({ length: this.modalQty }, () =>
      this.cartService.addToCart(product.id).toPromise()
    );
    Promise.all(calls).then(() => {
      this.isAddingToCart = false;
      this.closeProductModal();
      this.router.navigate(['/checkout']);
    }).catch((err: any) => {
      if (err?.status === 401) this.showToast('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ');
      else this.showToast('เกิดข้อผิดพลาด');
      this.isAddingToCart = false;
    });
  }

  viewProductDetail(product: Product) { this.router.navigate(['/product', product.id]); }

  showToast(message: string) {
    this.toastMessage = message;
    this.toastVisible = true;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.toastVisible = false, 3000);
  }
}
