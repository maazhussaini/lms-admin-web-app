import { Component, Input, Output, EventEmitter, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudMenuService } from './crud-menu.service';
import { Subscription } from 'rxjs';

export interface CrudMenuOptions {
  view: boolean;
  edit: boolean;
  delete: boolean;
  customActions: { icon: string; label: string; action: string; color?: string }[];
}

export interface CrudMenuAction {
  
  action: string;
  itemId: any;
}

@Component({
  selector: 'app-crud-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crud-menu.html',
  styleUrl: './crud-menu.scss'
})
export class CrudMenuComponent implements OnInit, OnDestroy {
  @Input() itemId: any;
  @Input() options: CrudMenuOptions = {
    view: true,
    edit: true,
    delete: true,
    customActions: []
  };

  @Output() viewAction = new EventEmitter<any>();
  @Output() editAction = new EventEmitter<any>();
  @Output() deleteAction = new EventEmitter<any>();
  @Output() customAction = new EventEmitter<CrudMenuAction>();
  @Output() menuClosed = new EventEmitter<void>();

  isMenuOpen = false;
  private menuId: string;
  private subscription: Subscription = new Subscription();

  constructor(private crudMenuService: CrudMenuService) {
    // Generate unique ID for each menu instance
    this.menuId = 'menu_' + Math.random().toString(36).substr(2, 9);
  }

  ngOnInit() {
    // Subscribe to global menu state
    this.subscription.add(
      this.crudMenuService.openMenuId$.subscribe(openMenuId => {
        this.isMenuOpen = openMenuId === this.menuId;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    // Close this menu if it's open
    if (this.isMenuOpen) {
      this.crudMenuService.closeAllMenus();
    }
  }

  toggleMenu() {
    if (this.isMenuOpen) {
      // Close this menu
      this.crudMenuService.closeAllMenus();
    } else {
      // Open this menu (automatically closes others)
      this.crudMenuService.setOpenMenu(this.menuId);
    }
  }

  closeMenu() {
    this.crudMenuService.closeAllMenus();
    this.menuClosed.emit();
  }

  onView(event?: Event) {
    event?.stopPropagation();
    this.viewAction.emit(this.itemId);
    this.closeMenu();
  }

  onEdit(event: Event) {
    event.stopPropagation();
    this.editAction.emit(this.itemId);
    this.closeMenu();
  }

  onDelete(event: Event) {
    event.stopPropagation();
    this.deleteAction.emit(this.itemId);
    this.closeMenu();
  }

  onCustomAction(event: Event, action: string) {
    event.stopPropagation();
    this.customAction.emit({ action, itemId: this.itemId });
    this.closeMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Close all menus when clicking outside
    this.crudMenuService.closeAllMenus();
  }
}