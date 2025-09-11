import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startItem: number;
  endItem: number;
}

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paginator.html',
  styleUrl: './paginator.scss'
})
export class Paginator implements OnInit, OnChanges {
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() maxVisiblePages: number = 10;

  @Output() pageChange = new EventEmitter<number>();

  paginationInfo: PaginationInfo = {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
    startItem: 0,
    endItem: 0
  };

  visiblePages: number[] = [];

  ngOnInit() {
    this.calculatePagination();
  }

  ngOnChanges() {
    this.calculatePagination();
  }

  calculatePagination() {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    const startItem = this.totalItems > 0 ? ((this.currentPage - 1) * this.itemsPerPage) + 1 : 0;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);

    this.paginationInfo = {
      currentPage: this.currentPage,
      totalPages: totalPages,
      totalItems: this.totalItems,
      itemsPerPage: this.itemsPerPage,
      startItem: startItem,
      endItem: endItem
    };

    this.calculateVisiblePages();
  }

  calculateVisiblePages() {
    const totalPages = this.paginationInfo.totalPages;
    const current = this.paginationInfo.currentPage;
    const maxVisible = this.maxVisiblePages;

    if (totalPages <= maxVisible) {
      // Show all pages if total pages is less than max visible
      this.visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Calculate visible pages with ellipsis logic
      const halfVisible = Math.floor(maxVisible / 2);
      let start = Math.max(1, current - halfVisible);
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      this.visiblePages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
  }

  onPageClick(page: number) {
    if (page !== this.currentPage && page >= 1 && page <= this.paginationInfo.totalPages) {
      this.pageChange.emit(page);
    }
  }

  onPreviousClick() {
    if (this.currentPage > 1) {
      this.onPageClick(this.currentPage - 1);
    }
  }

  onNextClick() {
    if (this.currentPage < this.paginationInfo.totalPages) {
      this.onPageClick(this.currentPage + 1);
    }
  }

  showLeftEllipsis(): boolean {
    return this.visiblePages.length > 0 && this.visiblePages[0] > 1;
  }

  showRightEllipsis(): boolean {
    return this.visiblePages.length > 0 && this.visiblePages[this.visiblePages.length - 1] < this.paginationInfo.totalPages;
  }
}
