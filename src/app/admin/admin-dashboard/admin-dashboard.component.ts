import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../product/product.service';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  @ViewChild('barChart') barChartRef!: ElementRef;
  @ViewChild('doughnutChart') doughnutChartRef!: ElementRef;
  @ViewChild('stockChart') stockChartRef!: ElementRef;
  @ViewChild('orderStatusChart') orderStatusChartRef!: ElementRef;

  // KPI
  totalProducts = 0;
  totalUsers = 0;
  lowStockCount = 0;
  totalValue = 0;
  totalRevenue = 0;
  totalOrders = 0;
  confirmedOrders = 0;
  pendingOrders = 0;

  isLoading = true;

  topSalesData: { name: string; qty: number; revenue: number }[] = [];

  private allProducts: any[] = [];
  private allOrders: any[] = [];
  private charts: Chart[] = [];

  constructor(private productService: ProductService, private http: HttpClient) {}

  ngOnInit() {
    forkJoin({
      products: this.productService.getAll(),
      users: this.http.get<any[]>('http://localhost:8080/api/users', { withCredentials: true }),
      orders: this.http.get<any[]>('http://localhost:8080/api/orders/admin', { withCredentials: true })
    }).subscribe({
      next: ({ products, users, orders }) => {
        this.allProducts = products as any[];
        this.allOrders = orders;

        // KPI
        this.totalProducts = products.length;
        this.lowStockCount = products.filter((p: any) => (p.stock ?? 0) < 20).length;
        this.totalValue = products.reduce((s: number, p: any) => s + (p.price ?? 0) * (p.stock ?? 0), 0);
        this.totalUsers = users.length;
        this.totalOrders = orders.length;
        this.confirmedOrders = orders.filter(o => o.status === 'CONFIRMED').length;
        this.pendingOrders = orders.filter(o => o.status === 'SLIP_UPLOADED').length;
        this.totalRevenue = orders
          .filter(o => o.status === 'CONFIRMED')
          .reduce((s, o) => s + (o.totalAmount ?? 0), 0);

        // Pre-compute sales map
        const salesMap = new Map<string, { qty: number; revenue: number }>();
        for (const order of orders.filter((o: any) => o.status === 'CONFIRMED')) {
          for (const item of (order.items || [])) {
            const cur = salesMap.get(item.productName) || { qty: 0, revenue: 0 };
            salesMap.set(item.productName, {
              qty: cur.qty + item.quantity,
              revenue: cur.revenue + item.subtotal
            });
          }
        }
        this.topSalesData = Array.from(salesMap.entries())
          .map(([name, v]) => ({ name, ...v }))
          .sort((a, b) => b.qty - a.qty);

        this.isLoading = false;
        // รอ Angular render canvas ก่อน
        setTimeout(() => this.buildCharts(), 150);
      },
      error: () => { this.isLoading = false; }
    });
  }

  buildCharts() {
    this.buildBarChart();
    this.buildDoughnutChart();
    this.buildStockChart();
    this.buildOrderStatusChart();
  }

  buildBarChart() {
    if (!this.barChartRef || this.topSalesData.length === 0) return;
    const top8 = this.topSalesData.slice(0, 8);
    const colors = ['#dc2626','#ea580c','#d97706','#16a34a','#2563eb','#7c3aed','#db2777','#0891b2'];
    const chart = new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: top8.map(x => x.name),
        datasets: [{
          label: 'จำนวนที่ขายได้ (ชิ้น)',
          data: top8.map(x => x.qty),
          backgroundColor: colors.slice(0, top8.length),
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { stepSize: 1 } },
          x: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
      }
    });
    this.charts.push(chart);
  }

  buildDoughnutChart() {
    if (!this.doughnutChartRef || this.topSalesData.length === 0) return;
    const top6 = this.topSalesData.slice(0, 6);
    const colors = ['#dc2626','#ea580c','#f59e0b','#10b981','#3b82f6','#8b5cf6'];
    const chart = new Chart(this.doughnutChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: top6.map(x => x.name),
        datasets: [{
          data: top6.map(x => x.revenue),
          backgroundColor: colors.slice(0, top6.length),
          hoverOffset: 8, borderWidth: 2
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 10, font: { size: 10 } } },
          tooltip: { callbacks: { label: (ctx) => ` ฿${Number(ctx.raw).toLocaleString()}` } }
        }
      }
    });
    this.charts.push(chart);
  }

  buildStockChart() {
    if (!this.stockChartRef) return;
    const sorted = [...this.allProducts]
      .filter(p => p.active !== false)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 10);
    const colors = sorted.map(p => p.stock === 0 ? '#ef4444' : p.stock < 20 ? '#f59e0b' : '#10b981');
    const chart = new Chart(this.stockChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: sorted.map(p => p.name),
        datasets: [{
          label: 'คงเหลือ (ชิ้น)',
          data: sorted.map(p => p.stock),
          backgroundColor: colors,
          borderRadius: 6, borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { stepSize: 5 } },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
      }
    });
    this.charts.push(chart);
  }

  buildOrderStatusChart() {
    if (!this.orderStatusChartRef || this.totalOrders === 0) return;
    const statusLabels = ['รอชำระ', 'รอตรวจสลิป', 'ยืนยันแล้ว', 'ยกเลิก'];
    const statusKeys = ['PENDING_PAYMENT', 'SLIP_UPLOADED', 'CONFIRMED', 'CANCELLED'];
    const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'];
    const data = statusKeys.map(k => this.allOrders.filter(o => o.status === k).length);
    // กรองสถานะที่มีข้อมูล
    const filtered = statusLabels
      .map((label, i) => ({ label, value: data[i], color: colors[i] }))
      .filter(x => x.value > 0);

    const chart = new Chart(this.orderStatusChartRef.nativeElement, {
      type: 'pie',
      data: {
        labels: filtered.map(x => x.label),
        datasets: [{
          data: filtered.map(x => x.value),
          backgroundColor: filtered.map(x => x.color),
          hoverOffset: 10, borderWidth: 2
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } }
        }
      }
    });
    this.charts.push(chart);
  }

  // ── Computed ──
  get topProducts() { return this.topSalesData.slice(0, 3); }

  get needRestockProducts() {
    return this.allProducts
      .filter(p => p.stock < 20 && p.active !== false)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);
  }

  ngOnDestroy() { this.charts.forEach(c => c.destroy()); }
}
