import { Offset, RelativeRect, RelPosition } from './position';

export interface DragContext extends Offset {
  frame: HTMLElement;
}

export interface CreateContext {
  pageIndex: number;
  frame: HTMLElement;
  start: RelPosition;
  lastPosition: RelPosition;
}

export interface ResizeContext {
  pageIndex: number;
  annotationId: string;
  frame: HTMLElement;
  origin: RelativeRect;
}
