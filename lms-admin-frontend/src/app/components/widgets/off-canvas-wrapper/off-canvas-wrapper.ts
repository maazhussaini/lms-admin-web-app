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

  @Output() onSubmit = new EventEmitter<void>();
  @Output() onClose = new EventEmitter<void>();
  @Output() onOpened = new EventEmitter<void>();
  @Output() onClosed = new EventEmitter<void>();

  @ContentChild('formContent', { static: false }) formContent!: TemplateRef<any>;

  ngAfterContentInit() {
    if (this.isOpen) {
      this.onOpened.emit();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      if (this.isOpen) {
        document.body.classList.add('off-canvas-open');
        this.onOpened.emit();
      } else {
        document.body.classList.remove('off-canvas-open');
        this.onClosed.emit();
      }
    }
  }

  closeCanvas() {
    this.onClose.emit();
  }

  saveForm() {
    if (this.canSave && !this.isLoading) {
      this.onSubmit.emit();
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
