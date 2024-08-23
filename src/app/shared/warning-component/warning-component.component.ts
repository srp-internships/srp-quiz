import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'srp-warning-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './warning-component.component.html',
  styleUrl: './warning-component.component.scss'
})
export class WarningComponent {
  @Input() isVisible = false;
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  confirm() {
    this.onConfirm.emit();
    this.closeAlert();
  }

  cancel() {
    this.onCancel.emit();
    this.closeAlert();
  }

  closeAlert() {
    this.isVisible = false;
  }
}