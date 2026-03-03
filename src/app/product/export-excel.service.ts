import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Product } from './product.model';

@Injectable({
  providedIn: 'root'
})
export class ExportExcelService {

  exportProducts(products: Product[], filename: string = 'รายการสินค้า') {

    // ✅ เตรียมข้อมูลที่จะ export
    const data = products.map((p, index) => ({
      'ลำดับ': index + 1,
      'ชื่อสินค้า': p.name,
      'หมวดหมู่': p.category || '-',
      'ราคา (บาท)': p.price,
      'จำนวนคงเหลือ': p.stock,
      'มูลค่าคงคลัง': (p.price ?? 0) * (p.stock ?? 0),
      'สถานะ': p.active ? 'Active' : 'Inactive'
    }));

    // ✅ สร้าง worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // ✅ กำหนดความกว้าง column
    ws['!cols'] = [
      { wch: 8 },   // ลำดับ
      { wch: 30 },  // ชื่อสินค้า
      { wch: 15 },  // หมวดหมู่
      { wch: 15 },  // ราคา
      { wch: 15 },  // จำนวน
      { wch: 18 },  // มูลค่า
      { wch: 12 },  // สถานะ
    ];

    // ✅ สร้าง workbook และเพิ่ม sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'สินค้า');

    // ✅ เพิ่ม sheet สรุป
    const summary = [
      ['รายงานสินค้า', ''],
      ['วันที่ export', new Date().toLocaleDateString('th-TH')],
      [''],
      ['สินค้าทั้งหมด', products.length],
      ['สินค้า Active', products.filter(p => p.active).length],
      ['สินค้า Inactive', products.filter(p => !p.active).length],
      ['มูลค่าคงคลังรวม', products.reduce((sum, p) => sum + (p.price ?? 0) * (p.stock ?? 0), 0)],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summary);
    wsSummary['!cols'] = [{ wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'สรุป');

    // ✅ download
    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `${filename}_${date}.xlsx`);
  }
}
