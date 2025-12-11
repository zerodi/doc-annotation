import { Offset, RelativeRect, RelPosition } from './position';

export type DragContext = {
  frame: HTMLElement;
} & Offset;

export type CreateContext = {
  pageIndex: number;
  frame: HTMLElement;
  start: RelPosition;
  lastPosition: RelPosition;
}

export type ResizeContext = {
  pageIndex: number;
  annotationId: string;
  frame: HTMLElement;
  origin: RelativeRect;
}
