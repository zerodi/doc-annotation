import { Directive, ElementRef, HostListener, inject, output } from '@angular/core';

import { RelPosition } from '../types/position';
import { calcRelativePos } from '../functions/calc';

@Directive({
  selector: '[appDragContainer]',
})
export class DragContainer {
  dropPosition = output<RelPosition>();

  readonly element: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();
    const pos = calcRelativePos(event, this.element);
    if (pos) {
      this.dropPosition.emit(pos);
    }
  }
}
