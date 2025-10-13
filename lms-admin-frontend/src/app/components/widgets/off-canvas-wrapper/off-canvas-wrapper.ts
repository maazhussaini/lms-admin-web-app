import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef, AfterContentInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-off-canvas-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './off-canvas-wrapper.html',
  styleUrl: './off-canvas-wrapper.scss'
})
export class OffCanvasWrapper implements AfterContentInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() saveButtonText: string = 'Save';
  @Input() showSaveButton: boolean = true;
  @Input() canSave: boolean = true;
  @Input() isLoading: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @ContentChild('formContent', { static: false }) formContent!: TemplateRef<any>;

  ngAfterContentInit() {
    if (this.isOpen) {
      this.opened.emit();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      if (this.isOpen) {
        document.body.classList.add('off-canvas-open');
        this.opened.emit();
      } else {
        document.body.classList.remove('off-canvas-open');
        this.closed.emit();
      }
    }
  }

  closeCanvas() {
    this.close.emit();
  }

  saveForm() {
    if (this.canSave && !this.isLoading) {
      this.submit.emit();
    }
  }

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeCanvas();
    }
  }

  onEscapeKey(event: any) {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Escape') {
      this.closeCanvas();
    }
  }
}
