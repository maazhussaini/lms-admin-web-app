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
  @Input() maxVisiblePages: number = 3;

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
    const safeCurrentPage = totalPages > 0
      ? Math.min(Math.max(1, this.currentPage), totalPages)
      : 1;
    const startItem = this.totalItems > 0 ? ((safeCurrentPage - 1) * this.itemsPerPage) + 1 : 0;
    const endItem = Math.min(safeCurrentPage * this.itemsPerPage, this.totalItems);

    this.paginationInfo = {
      currentPage: safeCurrentPage,
      totalPages: totalPages,
      totalItems: this.totalItems,
      itemsPerPage: this.itemsPerPage,
      startItem: startItem,
      endItem: endItem
    };

    this.currentPage = safeCurrentPage;
    this.calculateVisiblePages();
  }

  calculateVisiblePages() {
    const totalPages = this.paginationInfo.totalPages;

    if (totalPages === 0) {
      this.visiblePages = [];
      return;
    }

    const windowSize = Math.max(1, Math.min(3, this.maxVisiblePages, totalPages));
    const current = this.paginationInfo.currentPage;
    const half = Math.floor(windowSize / 2);

    let start = current - half;

    if (windowSize % 2 === 0) {
      start = current - (windowSize / 2 - 1);
    }

    start = Math.max(1, start);
    let end = start + windowSize - 1;

    if (end > totalPages) {
      end = totalPages;
      start = end - windowSize + 1;
    }

    this.visiblePages = Array.from({ length: windowSize }, (_, i) => start + i);
  }

  onPageClick(page: number) {
    if (page !== this.currentPage && page >= 1 && page <= this.paginationInfo.totalPages) {
      this.pageChange.emit(page);
    }
  }

  onFirstClick() {
    if (this.currentPage > 1) {
      this.onPageClick(1);
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

  onLastClick() {
    if (this.currentPage < this.paginationInfo.totalPages) {
      this.onPageClick(this.paginationInfo.totalPages);
    }
  }
}
