import { Directive, ElementRef, HostListener, OnDestroy, inject, output } from '@angular/core';

import { RelPosition } from '../types/position';
import { DragContext } from '../types/drag-context';
import { DragContainer } from './drag-container';
import { calcOffsetPos } from '../functions/calc';

@Directive({
  selector: '[appDragElement]',
})
export class DragElement implements OnDestroy {
  positionChange = output<RelPosition>();

  readonly element: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly container = inject(DragContainer, { optional: true });
  private dragContext: DragContext | null = null;

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    const frame = this.getContainer();

    if (!frame) {
      return;
    }

    const hostRect = this.element.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();

    if (!frameRect.width || !frameRect.height) {
      return;
    }

    this.stopDragging();
    event.preventDefault();
    event.stopPropagation();

    this.dragContext = {
      frame,
      offsetX: event.clientX - (hostRect.left + hostRect.width / 2),
      offsetY: event.clientY - (hostRect.top + hostRect.height / 2),
    };

    window.addEventListener('pointermove', this.handlePointerMove, { passive: false });
    window.addEventListener('pointerup', this.handlePointerUp, { passive: true });
  }

  private handlePointerMove = (event: PointerEvent): void => {
    if (!this.dragContext) {
      return;
    }

    event.preventDefault();

    const pos = calcOffsetPos(event, this.dragContext);
    if (pos) {
      this.positionChange.emit(pos);
    }

  };

  private handlePointerUp = (): void => {
    this.stopDragging();
  };

  ngOnDestroy(): void {
    this.stopDragging();
  }

  private stopDragging(): void {
    if (!this.dragContext) {
      return;
    }

    this.dragContext = null;
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
  }

  private getContainer(): HTMLElement | null {
    if (this.container) {
      return this.container.element;
    }
    return null;
  }
}
