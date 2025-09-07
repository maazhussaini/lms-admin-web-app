import { Component } from '@angular/core';

@Component({
  selector: 'app-side-nav',
  imports: [],
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.scss'
})
export class SideNav {
  activeMenuItem: string = 'tenants'; // Default active menu item

  setActiveMenuItem(menuItem: string): void {
    this.activeMenuItem = menuItem;
  }
}
