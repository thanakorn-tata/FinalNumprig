import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

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
  searchText: string = '';

  // Form data
  productForm: Product = {
    id: 0,
    name: '',
    description: '',
    price: 0,
    image: '',
    category: '',
    stock: 0
  };

  isEditing: boolean = false;
  showModal: boolean = false;

  categories: string[] = ['น้ำพริก', 'เครื่องปรุง', 'ของหวาน', 'ของทานเล่น'];

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    // Mock data - ในการใช้งานจริงควรดึงจาก API
    this.products = [
      {
        id: 1,
        name: 'น้ำพริกเผา',
        description: 'เผ็ดกำลังดี หอมกลิ่นกะปิ',
        price: 50,
        image: 'https://images.unsplash.com/photo-1596040033229-a0b55ee8b5c8?w=300&h=300&fit=crop',
        category: 'น้ำพริก',
        stock: 100
      },
      {
        id: 2,
        name: 'น้ำพริกปลาร้า',
        description: 'แซ่บนัว อร่อยแบบอีสาน',
        price: 60,
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&h=300&fit=crop',
        category: 'น้ำพริก',
        stock: 80
      },
      {
        id: 3,
        name: 'น้ำพริกหนุ่ม',
        description: 'รสชาติล้านนาแท้',
        price: 55,
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop',
        category: 'น้ำพริก',
        stock: 120
      }
    ];
    this.filteredProducts = [...this.products];
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

  openAddModal() {
    this.isEditing = false;
    this.productForm = {
      id: 0,
      name: '',
      description: '',
      price: 0,
      image: '',
      category: '',
      stock: 0
    };
    this.showModal = true;
  }

  openEditModal(product: Product) {
    this.isEditing = true;
    this.productForm = { ...product };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.productForm = {
      id: 0,
      name: '',
      description: '',
      price: 0,
      image: '',
      category: '',
      stock: 0
    };
  }

  saveProduct() {
    if (!this.productForm.name || !this.productForm.price || !this.productForm.category) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (this.isEditing) {
      // แก้ไขสินค้า
      const index = this.products.findIndex(p => p.id === this.productForm.id);
      if (index !== -1) {
        this.products[index] = { ...this.productForm };
        alert('แก้ไขสินค้าเรียบร้อยแล้ว');
      }
    } else {
      // เพิ่มสินค้าใหม่
      const newId = this.products.length > 0
        ? Math.max(...this.products.map(p => p.id)) + 1
        : 1;
      this.productForm.id = newId;
      this.products.push({ ...this.productForm });
      alert('เพิ่มสินค้าเรียบร้อยแล้ว');
    }

    this.filteredProducts = [...this.products];
    this.closeModal();
  }

  deleteProduct(product: Product) {
    const confirmed = confirm(`ต้องการลบสินค้า "${product.name}" หรือไม่?`);
    if (confirmed) {
      this.products = this.products.filter(p => p.id !== product.id);
      this.filteredProducts = [...this.products];
      alert('ลบสินค้าเรียบร้อยแล้ว');
    }
  }

  getTotalValue(): number {
    return this.products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  }

  getLowStockCount(): number {
    return this.products.filter(p => p.stock < 50).length;
  }
}
