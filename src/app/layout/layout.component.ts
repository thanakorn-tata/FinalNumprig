import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HomepageComponent } from "../homepage/homepage.component";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    HomepageComponent
],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {

  // ===== mock data (เอาออกได้ทีหลัง) =====
  cartCount = 2;
  username = 'User';

}
