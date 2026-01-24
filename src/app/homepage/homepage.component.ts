// homepage.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

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
  searchText: string = '';
  currentSlide: number = 0;
  carouselInterval: any;

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

  products: Product[] = [
    {
      id: 1,
      name: 'น้ำพริกเผา',
      description: 'เผ็ดกำลังดี หอมกลิ่นกะปิ',
      price: 50,
      image: 'https://images.unsplash.com/photo-1596040033229-a0b55ee8b5c8?w=300&h=300&fit=crop',
      category: 'น้ำพริก'
    },
    {
      id: 2,
      name: 'น้ำพริกปลาร้า',
      description: 'แซ่บนัว อร่อยแบบอีสาน',
      price: 60,
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&h=300&fit=crop',
      category: 'น้ำพริก'
    },
    {
      id: 3,
      name: 'น้ำพริกหนุ่ม',
      description: 'รสชาติล้านนาแท้',
      price: 55,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop',
      category: 'น้ำพริก'
    },
    {
      id: 4,
      name: 'น้ำพริกกะปิ',
      description: 'หอมกรุ่น เข้มข้น',
      price: 65,
      image: 'https://images.unsplash.com/photo-1596040033229-a0b55ee8b5c8?w=300&h=300&fit=crop',
      category: 'น้ำพริก'
    },
    {
      id: 5,
      name: 'น้ำพริกปลาทู',
      description: 'รสชาติเข้มข้น กลมกล่อม',
      price: 70,
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&h=300&fit=crop',
      category: 'น้ำพริก'
    },
    {
      id: 6,
      name: 'น้ำพริกมะม่วง',
      description: 'เปร้ยว หวาน อร่อย',
      price: 45,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop',
      category: 'น้ำพริก'
    },
    {
      id: 7,
      name: 'น้ำพริกลงเรือ',
      description: 'รสชาติเข้มข้นจากใต้',
      price: 75,
      image: 'https://images.unsplash.com/photo-1596040033229-a0b55ee8b5c8?w=300&h=300&fit=crop',
      category: 'น้ำพริก'
    },
    {
      id: 8,
      name: 'น้ำพริกมะเขือ',
      description: 'หอมเครื่องเทศ อร่อยถูกปาก',
      price: 50,
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&h=300&fit=crop',
      category: 'น้ำพริก'
    }
  ];

  filteredProducts: Product[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.filteredProducts = [...this.products];
    this.startCarousel();
  }

  ngOnDestroy() {
    this.stopCarousel();
  }

  startCarousel() {
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopCarousel() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

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
    if (!this.searchText.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
  }

  addToCart(product: Product) {
    console.log('เพิ่มสินค้าลงตะกร้า:', product);
    alert(`เพิ่ม ${product.name} ลงตะกร้าเรียบร้อย!`);
  }

  viewProductDetail(product: Product) {
    console.log('ดูรายละเอียดสินค้า:', product);
    // this.router.navigate(['/product', product.id]);
  }

  goToProductManagement() {
    this.router.navigate(['/products']);
  }
}
