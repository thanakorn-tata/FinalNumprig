import { Component, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-homepage',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.css']
})
export class HomepageComponent  {
    initForm: boolean = false;
    lang: string = 'th';


    totalRecords: number = 0;
    rows: number = 5;
 constructor(
    private router: Router
  )
{}
    }
