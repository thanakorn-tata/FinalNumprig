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

  slides: CarouselSlide[] = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1596040033229-a0b55ee8b5c8?w=1200&h=400&fit=crop',
      title: 'น้ำพริกแม่บ้าน',
      subtitle: 'รสชาติต้นตำรับ ส่งตรงจากบ้าน'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1200&h=400&fit=crop',
      title: 'ลดราคาพิเศษ',
      subtitle: 'ซื้อ 2 แถม 1 สำหรับทุกรายการ'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop',
      title: 'ฟรีค่าส่ง',
      subtitle: 'เมื่อซื้อครบ 300 บาท'
    }
  ];

  products: Product[] = [];
  filteredProducts: Product[] = [];

  constructor(
    private router: Router,
    private productService: ProductService,
    private auth: AuthService,
    private cartService: CartService  // ✅ inject CartService
  ) {}

  ngOnInit() {
    this.startCarousel();

    this.auth.getUser().subscribe((user: any) => {
      this.isAdmin = user?.role === 'ADMIN';
    });

    this.productService.getAllActive().subscribe({
      next: (data: Product[]) => {
        this.products = data;
        this.filteredProducts = [...data];
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  ngOnDestroy() {
    this.stopCarousel();
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }

  startCarousel() {
    this.carouselInterval = setInterval(() => this.nextSlide(), 5000);
  }

  stopCarousel() {
    if (this.carouselInterval) clearInterval(this.carouselInterval);
  }

  onCarouselMouseEnter() { this.stopCarousel(); }
  onCarouselMouseLeave() { this.startCarousel(); }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = this.currentSlide === 0
      ? this.slides.length - 1
      : this.currentSlide - 1;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  searchProducts() {
    const keyword = this.searchText.trim().toLowerCase();
    this.filteredProducts = keyword
      ? this.products.filter(p =>
          p.name.toLowerCase().includes(keyword) ||
          p.description.toLowerCase().includes(keyword))
      : [...this.products];
  }

  // ✅ เรียก API จริง
  addToCart(product: Product) {
    this.cartService.addToCart(product.id).subscribe({
      next: () => this.showToast(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว! 🛒`),
      error: (err) => {
        if (err.status === 401) {
          this.showToast('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้า');
        } else {
          this.showToast('เพิ่มสินค้าไม่สำเร็จ');
        }
      }
    });
  }

  viewProductDetail(product: Product) {
    this.router.navigate(['/product', product.id]);
  }

  goToProductManagement() {
    this.router.navigate(['/products']);
  }

  showToast(message: string) {
    this.toastMessage = message;
    this.toastVisible = true;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.toastVisible = false, 3000);
  }
}
