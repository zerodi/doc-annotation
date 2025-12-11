import { Component, HostBinding, input, output } from '@angular/core';

import { RelativeRect } from '../../types/position';

@Component({
  selector: 'app-annotation',
  templateUrl: './annotation.html',
  styleUrl: './annotation.less',
})
export class Annotation {
  annotationId = input.required<string>();
  rect = input.required<RelativeRect>();
  text = input<string>('');
  isSelection = input<boolean>(false);
  remove = output<string>();
  resizeStart = output<PointerEvent>();
  textChange = output<string>();

  @HostBinding('style.left.%')
  get left(): number {
    return this.rect().relativeX * 100;
  }

  @HostBinding('style.top.%')
  get top(): number {
    return this.rect().relativeY * 100;
  }

  @HostBinding('style.width.%')
  get width(): number {
    return this.rect().relativeWidth * 100;
  }

  @HostBinding('style.height.%')
  get height(): number {
    return this.rect().relativeHeight * 100;
  }

  @HostBinding('class.annotation--selection')
  get selectionClass(): boolean {
    return this.isSelection();
  }

  delete(event: Event): void {
    event.stopPropagation();
    this.remove.emit(this.annotationId());
  }

  startResize(event: PointerEvent): void {
    this.resizeStart.emit(event);
  }

  handleTextInput(event: Event): void {
    const target = event.target as HTMLElement;
    this.textChange.emit(target.textContent ?? '');
  }
}
