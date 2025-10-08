import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Paginator } from './paginator';

describe('Paginator', () => {
  let component: Paginator;
  let fixture: ComponentFixture<Paginator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paginator]
    }).compileComponents();

    fixture = TestBed.createComponent(Paginator);
    component = fixture.componentInstance;
  });

  it('should center current page within a three-item window where possible', () => {
    component.itemsPerPage = 10;
    component.totalItems = 100; // 10 pages
    component.currentPage = 5;

    component.calculatePagination();

    expect(component.visiblePages).toEqual([4, 5, 6]);
    expect(component.paginationInfo.currentPage).toBe(5);
  });

  it('should keep tail window anchored to the end for last pages', () => {
    component.itemsPerPage = 10;
    component.totalItems = 100; // 10 pages
    component.currentPage = 10;

    component.calculatePagination();

    expect(component.visiblePages).toEqual([8, 9, 10]);
    expect(component.paginationInfo.currentPage).toBe(10);
  });

  it('should handle reduced page counts gracefully', () => {
    component.itemsPerPage = 10;
    component.totalItems = 15; // 2 pages
    component.currentPage = 2;

    component.calculatePagination();

    expect(component.visiblePages).toEqual([1, 2]);
    expect(component.paginationInfo.totalPages).toBe(2);
  });

  it('should emit navigation events for first and last shortcuts', () => {
    component.itemsPerPage = 5;
    component.totalItems = 25; // 5 pages
    component.currentPage = 3;

    component.calculatePagination();

    const emitSpy = spyOn(component.pageChange, 'emit');

    component.onFirstClick();
    component.onLastClick();

    expect(emitSpy).toHaveBeenCalledWith(1);
    expect(emitSpy).toHaveBeenCalledWith(component.paginationInfo.totalPages);
    expect(emitSpy).toHaveBeenCalledTimes(2);
  });
});
