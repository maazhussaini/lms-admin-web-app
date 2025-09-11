import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CrudMenuService {
  private openMenuId = new BehaviorSubject<string | null>(null);
  
  openMenuId$ = this.openMenuId.asObservable();
  
  setOpenMenu(menuId: string | null) {
    this.openMenuId.next(menuId);
  }
  
  closeAllMenus() {
    this.openMenuId.next(null);
  }
  
  isMenuOpen(menuId: string): boolean {
    return this.openMenuId.value === menuId;
  }
}
