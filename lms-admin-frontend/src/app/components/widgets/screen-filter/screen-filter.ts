import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterConfig {
  [key: string]: any;
}

export interface FilterOptions {
  label: string;
  value: string;
  options: { label: string; value: any; }[];
}

@Component({
  selector: 'app-screen-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './screen-filter.html',
  styleUrl: './screen-filter.scss'
})
export class ScreenFilter {
  @Input() searchTerm: string = '';
  @Input() itemsPerPage: number = 10;
  @Input() filters: FilterConfig = {};
  @Input() filterOptions: FilterOptions[] = [];
  @Input() showAddButton: boolean = true;
  @Input() addButtonText: string = 'Add';
  @Input() searchPlaceholder: string = 'Search here';

  @Output() searchChange = new EventEmitter<string>();
  @Output() itemsPerPageChange = new EventEmitter<number>();
  @Output() filterChange = new EventEmitter<FilterConfig>();
  @Output() addClick = new EventEmitter<void>();
  @Output() applyFilters = new EventEmitter<FilterConfig>();
  @Output() resetFilters = new EventEmitter<void>();

  showFilterPopup: boolean = false;

  onSearchInput(value: string) {
    this.searchTerm = value;
    this.searchChange.emit(value);
  }

  onItemsPerPageSelect(value: number) {
    this.itemsPerPage = value;
    this.itemsPerPageChange.emit(value);
  }

  toggleFilterPopup() {
    this.showFilterPopup = !this.showFilterPopup;
  }

  onAddClick() {
    this.addClick.emit();
  }

  onApplyFilters() {
    this.applyFilters.emit(this.filters);
    this.showFilterPopup = false;
  }

  onResetAllFilters() {
    // Reset all filters to empty/default values
    Object.keys(this.filters).forEach(key => {
      this.filters[key] = '';
    });
    this.resetFilters.emit();
    this.showFilterPopup = false;
  }

  onFilterChange() {
    this.filterChange.emit(this.filters);
  }
}
